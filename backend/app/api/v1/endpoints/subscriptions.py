"""CRUD and workflow endpoints for subscription plans, proration, and cancellation."""
from __future__ import annotations

from datetime import date
from dateutil.relativedelta import relativedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import DbSession, get_current_user, require_role
from app.models.subscription import (
    BillingSchedule,
    CancellationRule,
    ProrationRule,
    ScheduleStatus,
    SubscriptionPlan,
)
from app.models.quotation import QuotationLine
from app.models.user import User
from app.schemas.subscription import (
    BillingScheduleOut,
    CancelSubscriptionOut,
    CancelSubscriptionRequest,
    CancellationRuleCreate,
    CancellationRuleOut,
    ProrationConfirmRequest,
    ProrationPreviewOut,
    ProrationPreviewRequest,
    SubscriptionPlanCreate,
    SubscriptionPlanOut,
    SubscriptionPlanUpdate,
    ProrationRuleCreate,
    ProrationRuleOut,
)
from app.services import proration_service, refund_service

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

# ─────────────────────────────────────────────────────────────────────────────
# SubscriptionPlan CRUD
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/plans", response_model=SubscriptionPlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: SubscriptionPlanCreate,
    db: DbSession,
    _: User = Depends(require_role("Admin", "SalesManager")),
) -> SubscriptionPlanOut:
    """Create a new subscription plan linked to a product."""
    plan = SubscriptionPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/plans", response_model=List[SubscriptionPlanOut])
def list_plans(db: DbSession) -> List[SubscriptionPlanOut]:
    """List all subscription plans."""
    return db.query(SubscriptionPlan).all()


@router.get("/plans/{plan_id}", response_model=SubscriptionPlanOut)
def get_plan(plan_id: int, db: DbSession) -> SubscriptionPlanOut:
    """Retrieve a single subscription plan."""
    plan = db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan


@router.get("/plans/{plan_id}/billing-detail")
def get_plan_billing_detail(plan_id: int, db: DbSession) -> dict:
    """Return a plan with its billing schedule and related customer context."""
    plan = db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    schedules = (
        db.query(BillingSchedule)
        .filter(BillingSchedule.plan_id == plan_id)
        .order_by(BillingSchedule.billing_date)
        .all()
    )
    schedule_rows = []
    customers = set()
    for schedule in schedules:
        line = schedule.quotation_line
        quotation = line.quotation if line else None
        customer = quotation.customer if quotation else None
        customer_name = customer.name if customer else None
        if customer_name:
            customers.add(customer_name)
        schedule_rows.append({
            "id": schedule.id,
            "quotation_line_id": schedule.quotation_line_id,
            "billing_date": schedule.billing_date,
            "amount": schedule.amount,
            "status": schedule.status,
            "customer_name": customer_name,
            "quotation_id": quotation.id if quotation else None,
            "projected": False,
        })

    if not schedule_rows:
        cycle_count = {"monthly": 12, "quarterly": 4, "yearly": 1}[plan.cadence.value]
        cycle_step = {"monthly": relativedelta(months=1), "quarterly": relativedelta(months=3), "yearly": relativedelta(years=1)}[plan.cadence.value]
        start_date = date.today()
        for cycle_index in range(cycle_count):
            schedule_rows.append({
                "id": f"projected-{plan.id}-{cycle_index + 1}",
                "quotation_line_id": None,
                "billing_date": start_date + cycle_step * cycle_index,
                "amount": plan.price,
                "status": ScheduleStatus.SCHEDULED if plan.is_active else ScheduleStatus.FAILED,
                "customer_name": None,
                "quotation_id": None,
                "projected": True,
            })

    return {
        "id": plan.id,
        "name": plan.name,
        "cadence": plan.cadence,
        "product_id": plan.product_id,
        "price": plan.price,
        "is_active": plan.is_active,
        "created_at": plan.created_at,
        "customers": sorted(customers),
        "schedules": schedule_rows,
    }


@router.post("/plans/{plan_id}/cancel")
def cancel_plan(plan_id: int, db: DbSession, _: User = Depends(require_role("Admin", "SalesManager"))) -> dict:
    """Deactivate a plan and cancel its future attached billing schedules."""
    plan = db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    plan.is_active = False
    schedules = db.query(BillingSchedule).filter(
        BillingSchedule.plan_id == plan_id,
        BillingSchedule.status == ScheduleStatus.SCHEDULED,
        BillingSchedule.billing_date >= date.today(),
    ).all()
    for schedule in schedules:
        schedule.status = "Failed"
    db.commit()
    return {"id": plan.id, "is_active": plan.is_active, "cancelled_schedules": len(schedules)}


@router.patch("/plans/{plan_id}", response_model=SubscriptionPlanOut)
def update_plan(
    plan_id: int,
    payload: SubscriptionPlanUpdate,
    db: DbSession,
    _: User = Depends(require_role("Admin", "SalesManager")),
) -> SubscriptionPlanOut:
    """Partially update a subscription plan."""
    plan = db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    for schedule in plan.billing_schedules:
        if schedule.status == ScheduleStatus.SCHEDULED:
            quantity = schedule.quotation_line.quantity if schedule.quotation_line else 1
            schedule.amount = plan.price * quantity
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    db: DbSession,
    _: User = Depends(require_role("Admin")),
) -> None:
    """Delete a subscription plan."""
    plan = db.get(SubscriptionPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    db.delete(plan)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# ProrationRule CRUD
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/proration-rules", response_model=ProrationRuleOut, status_code=status.HTTP_201_CREATED)
def create_proration_rule(
    payload: ProrationRuleCreate,
    db: DbSession,
    _: User = Depends(require_role("Admin")),
) -> ProrationRuleOut:
    """Create a proration rule for a plan."""
    rule = ProrationRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/proration-rules", response_model=List[ProrationRuleOut])
def list_proration_rules(db: DbSession) -> List[ProrationRuleOut]:
    return db.query(ProrationRule).all()


@router.delete("/proration-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_proration_rule(
    rule_id: int,
    db: DbSession,
    _: User = Depends(require_role("Admin")),
) -> None:
    rule = db.get(ProrationRule, rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proration rule not found")
    db.delete(rule)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# CancellationRule CRUD
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/cancellation-rules", response_model=CancellationRuleOut, status_code=status.HTTP_201_CREATED)
def create_cancellation_rule(
    payload: CancellationRuleCreate,
    db: DbSession,
    _: User = Depends(require_role("Admin")),
) -> CancellationRuleOut:
    """Create a cancellation rule for a plan."""
    rule = CancellationRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.get("/cancellation-rules", response_model=List[CancellationRuleOut])
def list_cancellation_rules(db: DbSession) -> List[CancellationRuleOut]:
    return db.query(CancellationRule).all()


@router.delete("/cancellation-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cancellation_rule(
    rule_id: int,
    db: DbSession,
    _: User = Depends(require_role("Admin")),
) -> None:
    rule = db.get(CancellationRule, rule_id)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cancellation rule not found")
    db.delete(rule)
    db.commit()


# ─────────────────────────────────────────────────────────────────────────────
# Proration preview / confirm
# ─────────────────────────────────────────────────────────────────────────────


def _get_recurring_line(db: Session, line_id: int) -> QuotationLine:
    line = db.get(QuotationLine, line_id)
    if not line:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation line not found")
    if line.plan_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Line is not a recurring subscription line")
    return line


@router.post("/lines/{line_id}/proration-preview", response_model=ProrationPreviewOut)
def proration_preview(
    line_id: int,
    payload: ProrationPreviewRequest,
    db: DbSession,
    _: User = Depends(get_current_user),
) -> ProrationPreviewOut:
    """
    Preview proration math for a plan/quantity change without committing.
    """
    line = _get_recurring_line(db, line_id)
    try:
        result = proration_service.compute_proration(
            db, line, payload.new_plan_id, payload.new_quantity, payload.change_date
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return ProrationPreviewOut(**{k: v for k, v in result.items() if not k.startswith("_")})


@router.post("/lines/{line_id}/modify")
def modify_subscription_line(
    line_id: int,
    payload: ProrationConfirmRequest,
    db: DbSession,
    _: User = Depends(require_role("Admin", "SalesManager", "SalesRep")),
) -> dict:
    """
    Apply a plan or quantity change with proration; generates Invoice or CreditNote.
    """
    line = _get_recurring_line(db, line_id)
    try:
        result = proration_service.apply_proration(
            db, line, payload.new_plan_id, payload.new_quantity, payload.change_date
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Cancellation
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/lines/{line_id}/cancel", response_model=CancelSubscriptionOut)
def cancel_subscription_line(
    line_id: int,
    payload: CancelSubscriptionRequest,
    db: DbSession,
    _: User = Depends(require_role("Admin", "SalesManager")),
) -> CancelSubscriptionOut:
    """
    Cancel a subscription line: mark future schedules Failed, issue CreditNote.
    """
    line = _get_recurring_line(db, line_id)
    try:
        result = refund_service.cancel_subscription_line(db, line, payload.cancellation_date)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return CancelSubscriptionOut(**result)
