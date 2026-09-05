"""
Refund service: subscription cancellation with rule-driven credit notes.

Cancellation logic
------------------
* `full`    → refund = entire current-cycle amount (plan.price * quantity)
* `partial` → refund = (days_remaining / total_days_in_cycle) * cycle_amount  (same ratio as proration)
* `none`    → refund = 0

Steps:
1. Find remaining future BillingSchedule rows and mark them `Failed`.
2. Calculate refund amount based on CancellationRule.
3. If refund > 0, create a CreditNote against the latest Invoice.
4. Return cancellation summary.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models.invoice import CreditNote
from app.models.quotation import QuotationLine
from app.models.subscription import (
    BillingSchedule,
    CancellationRule,
    RefundType,
    ScheduleStatus,
    SubscriptionCadence,
)

_DAYS_PER_CYCLE = {
    SubscriptionCadence.MONTHLY: 30,
    SubscriptionCadence.QUARTERLY: 91,
    SubscriptionCadence.YEARLY: 365,
}

_MONTHS_PER_CYCLE = {
    SubscriptionCadence.MONTHLY: 1,
    SubscriptionCadence.QUARTERLY: 3,
    SubscriptionCadence.YEARLY: 12,
}


def _latest_invoice(db: Session, quotation_id: int):
    from app.models.invoice import Invoice  # local import to break circulars

    return (
        db.query(Invoice)
        .filter(Invoice.quotation_id == quotation_id)
        .order_by(Invoice.created_at.desc())
        .first()
    )


def _days_remaining(cancel_date: date, last_billing_date: date, cadence: SubscriptionCadence) -> int:
    cycle_end = last_billing_date + relativedelta(days=_DAYS_PER_CYCLE[cadence])
    remaining = (cycle_end - cancel_date).days
    return max(remaining, 0)


def cancel_subscription_line(
    db: Session,
    line: QuotationLine,
    cancellation_date: date,
) -> dict:
    """
    Cancel a subscription quotation line.

    Returns
    -------
    {
        "cancelled_schedules": int,
        "refund_amount": Decimal,
        "credit_note_id": Optional[int],
    }
    """
    plan = line.plan
    if plan is None:
        raise ValueError(f"QuotationLine {line.id} is not a recurring line (no plan_id).")

    # 1. Cancel future schedules
    future_scheds = (
        db.query(BillingSchedule)
        .filter(
            BillingSchedule.quotation_line_id == line.id,
            BillingSchedule.billing_date > cancellation_date,
            BillingSchedule.status == ScheduleStatus.SCHEDULED,
        )
        .all()
    )
    for sched in future_scheds:
        sched.status = ScheduleStatus.FAILED
        db.add(sched)

    cancelled_count = len(future_scheds)

    # 2. Find current active schedule (last one on or before cancel_date)
    current_sched = (
        db.query(BillingSchedule)
        .filter(
            BillingSchedule.quotation_line_id == line.id,
            BillingSchedule.billing_date <= cancellation_date,
            BillingSchedule.status != ScheduleStatus.FAILED,
        )
        .order_by(BillingSchedule.billing_date.desc())
        .first()
    )

    cycle_amount = (plan.price * line.quantity).quantize(Decimal("0.01"))

    # 3. Determine refund per CancellationRule
    cancellation_rule: Optional[CancellationRule] = (
        db.query(CancellationRule)
        .filter(CancellationRule.plan_id == plan.id)
        .first()
    )

    refund_amount = Decimal("0")
    if cancellation_rule:
        if cancellation_rule.refund_type == RefundType.FULL:
            refund_amount = cycle_amount
        elif cancellation_rule.refund_type == RefundType.PARTIAL:
            if current_sched:
                last_billing = current_sched.billing_date
            else:
                last_billing = cancellation_date
            days_rem = _days_remaining(cancellation_date, last_billing, plan.cadence)
            total_days = _DAYS_PER_CYCLE[plan.cadence]
            refund_amount = (
                (Decimal(days_rem) / Decimal(total_days)) * cycle_amount
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        # RefundType.NONE → refund stays 0

    # 4. Create CreditNote if refund > 0
    credit_note_id: Optional[int] = None
    if refund_amount > 0:
        latest_inv = _latest_invoice(db, line.quotation_id)
        if latest_inv:
            cn = CreditNote(
                invoice_id=latest_inv.id,
                amount=refund_amount,
                reason=f"Cancellation refund for subscription line {line.id}",
            )
            db.add(cn)
            db.flush()
            credit_note_id = cn.id

    db.commit()

    return {
        "cancelled_schedules": cancelled_count,
        "refund_amount": refund_amount,
        "credit_note_id": credit_note_id,
    }
