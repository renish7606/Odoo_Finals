"""Expose current approval state for signed-in staff."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func as sa_func
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep, AuditLogEntry
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.customer import Customer
from app.models.product import Product
from app.models.user import User
from app.services.approval_service import evaluate_and_route_approval
from app.schemas.approval import ApprovalDecision
from datetime import datetime, timezone

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("")
def list_approvals(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """List all approval requests with quotation, customer, and step info."""
    requests = db.scalars(
        select(ApprovalRequest).order_by(ApprovalRequest.created_at.desc())
    ).all()

    results = []
    for req in requests:
        quotation = db.get(Quotation, req.quotation_id)
        if not quotation:
            continue

        customer = db.get(Customer, quotation.customer_id) if quotation.customer_id else None
        rep = db.get(User, quotation.rep_id) if quotation.rep_id else None

        # Determine the current stage label
        steps = db.scalars(
            select(ApprovalStep)
            .where(ApprovalStep.approval_request_id == req.id)
            .order_by(ApprovalStep.step_number)
        ).all()

        current_stage = "Pending"
        assigned_to = "-"
        if req.status == ApprovalStatus.APPROVED:
            current_stage = "Auto-Approved" if not steps else "Approved"
        elif req.status == ApprovalStatus.REJECTED:
            current_stage = "Rejected"
        elif req.status == ApprovalStatus.RETURNED:
            current_stage = "Returned"
        else:
            # Find current active step
            for step in steps:
                if step.decision is None:
                    current_stage = step.approver_role.value if step.approver_role else "Pending"
                    if step.decided_by:
                        decider = db.get(User, step.decided_by)
                        assigned_to = decider.full_name if decider else "-"
                    break

        # Determine risk label
        score = float(req.blended_risk_score) if req.blended_risk_score else 0
        if score == 0:
            risk_label = "LOW"
        elif score < 5:
            risk_label = "MEDIUM"
        else:
            risk_label = "HIGH"

        results.append({
            "id": req.id,
            "quotation_id": req.quotation_id,
            "quotation_ref": f"Q-{req.quotation_id:04d}",
            "customer_name": customer.name if customer else "Unknown",
            "customer_tier": customer.tier.value if customer and hasattr(customer.tier, "value") else "Bronze",
            "rep_name": rep.full_name if rep else "-",
            "status": req.status.value,
            "blended_risk": risk_label,
            "blended_risk_score": score,
            "current_stage": current_stage,
            "assigned_to": assigned_to,
            "created_at": req.created_at.isoformat() if req.created_at else None,
        })

    return results


@router.get("/{quotation_id}")
def get_approval(quotation_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Return a quotation's approval request, steps, line details, and audit trail."""
    if db.get(Quotation, quotation_id) is None:
        raise HTTPException(status_code=404, detail="Quotation was not found")

    request = db.scalar(select(ApprovalRequest).where(ApprovalRequest.quotation_id == quotation_id))
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No approval request exists for this quotation. Evaluate the quotation first.",
        )

    quotation = db.get(Quotation, quotation_id)
    customer = db.get(Customer, quotation.customer_id) if quotation.customer_id else None
    rep = db.get(User, quotation.rep_id) if quotation.rep_id else None

    steps = db.scalars(
        select(ApprovalStep)
        .where(ApprovalStep.approval_request_id == request.id)
        .order_by(ApprovalStep.step_number)
    ).all()

    # Get line-level discount analysis
    lines = db.scalars(
        select(QuotationLine).where(QuotationLine.quotation_id == quotation_id)
    ).all()

    line_details = []
    from app.models.discount import CategoryDiscountCeiling, DiscountTier
    for ln in lines:
        product = db.get(Product, ln.product_id) if ln.product_id else None
        product_name = product.name if product else f"Product #{ln.product_id}"
        category = product.category if product else ""

        # Find the applicable ceiling
        tier_disc = db.scalar(
            select(DiscountTier).where(DiscountTier.customer_tier == customer.tier)
        ) if customer else None
        cat_disc = db.scalar(
            select(CategoryDiscountCeiling).where(CategoryDiscountCeiling.category == category)
        ) if category else None

        ceiling = float(tier_disc.max_discount_percent) if tier_disc else 100
        if cat_disc:
            ceiling = min(ceiling, float(cat_disc.max_discount_percent))

        discount_given = float(ln.discount_percent) if ln.discount_percent else 0
        overage = max(0, discount_given - ceiling)

        line_details.append({
            "line_id": ln.id,
            "product_name": f"{product_name} ({category})" if category else product_name,
            "discount_given": discount_given,
            "limit_allowed": ceiling,
            "over_by": overage,
            "over_label": f"{overage} pt OVER" if overage > 0 else "0 pt - OK",
        })

    # Get audit log entries
    audit_entries = db.scalars(
        select(AuditLogEntry)
        .where(AuditLogEntry.entity_type == "approval_request")
        .where(AuditLogEntry.entity_id == request.id)
        .order_by(AuditLogEntry.timestamp)
    ).all()

    audit_trail = []
    for entry in audit_entries:
        entry_user = db.get(User, entry.user_id) if entry.user_id else None
        audit_trail.append({
            "user": entry_user.full_name if entry_user else "System",
            "action": entry.action,
            "date": entry.timestamp.strftime("%b %d") if entry.timestamp else "-",
            "note": entry.reason or "-",
        })

    # Determine risk label
    score = float(request.blended_risk_score) if request.blended_risk_score else 0
    if score == 0:
        risk_label = "LOW"
    elif score < 5:
        risk_label = "MEDIUM"
    else:
        risk_label = "HIGH"

    steps_data = []
    for s in steps:
        decider = db.get(User, s.decided_by) if s.decided_by else None
        steps_data.append({
            "step_number": s.step_number,
            "approver_role": s.approver_role.value if s.approver_role else "Unknown",
            "decision": s.decision,
            "decided_by": decider.full_name if decider else None,
            "decided_at": s.decided_at.isoformat() if s.decided_at else None,
            "reason": s.reason,
        })

    return {
        "request_id": request.id,
        "quotation_id": quotation_id,
        "quotation_ref": f"Q-{quotation_id:04d}",
        "customer_name": customer.name if customer else "Unknown",
        "customer_tier": customer.tier.value if customer and hasattr(customer.tier, "value") else "Bronze",
        "rep_name": rep.full_name if rep else "-",
        "status": request.status.value,
        "blended_risk": risk_label,
        "blended_risk_score": score,
        "current_step": request.current_step,
        "steps": steps_data,
        "lines": line_details,
        "audit_trail": audit_trail,
    }


@router.post("/{quotation_id}/decide")
def decide_approval(
    quotation_id: int,
    payload: ApprovalDecision,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Approve, reject, or return an approval request."""
    request = db.scalar(select(ApprovalRequest).where(ApprovalRequest.quotation_id == quotation_id))
    if not request:
        raise HTTPException(status_code=404, detail="No approval request found for this quotation")

    quotation = db.get(Quotation, quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Find the current pending step
    steps = db.scalars(
        select(ApprovalStep)
        .where(ApprovalStep.approval_request_id == request.id)
        .order_by(ApprovalStep.step_number)
    ).all()

    current_step = None
    for step in steps:
        if step.decision is None:
            current_step = step
            break

    now = datetime.now(timezone.utc)

    if payload.decision == "APPROVE":
        if current_step:
            current_step.decision = "APPROVED"
            current_step.decided_by = user.id
            current_step.decided_at = now
            current_step.reason = payload.reason

            # Check if there are more steps
            next_step = None
            for step in steps:
                if step.decision is None and step.id != current_step.id:
                    next_step = step
                    break

            if next_step:
                request.current_step = next_step.step_number
                request.status = ApprovalStatus.PENDING_FINANCE
            else:
                request.status = ApprovalStatus.APPROVED
                quotation.status = QuotationStatus.APPROVED
        else:
            request.status = ApprovalStatus.APPROVED
            quotation.status = QuotationStatus.APPROVED

    elif payload.decision == "REJECT":
        if current_step:
            current_step.decision = "REJECTED"
            current_step.decided_by = user.id
            current_step.decided_at = now
            current_step.reason = payload.reason
        request.status = ApprovalStatus.REJECTED
        quotation.status = QuotationStatus.REJECTED

    elif payload.decision == "RETURN":
        if current_step:
            current_step.decision = "RETURNED"
            current_step.decided_by = user.id
            current_step.decided_at = now
            current_step.reason = payload.reason
        request.status = ApprovalStatus.RETURNED
        quotation.status = QuotationStatus.DRAFT

    # Log the audit entry
    audit = AuditLogEntry(
        user_id=user.id,
        action=payload.decision,
        entity_type="approval_request",
        entity_id=request.id,
        reason=payload.reason,
    )
    db.add(audit)
    db.commit()

    return {"status": request.status.value, "quotation_status": quotation.status.value}


@router.post("/{quotation_id}/evaluate")
def evaluate_quotation_approval(
    quotation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Evaluate a quotation and create or update its approval request."""
    try:
        result = evaluate_and_route_approval(quotation_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    db.commit()
    return result
