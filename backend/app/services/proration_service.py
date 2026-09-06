from __future__ import annotations

"""
Proration service: compute and apply mid-cycle plan/quantity changes.

Formula (days_remaining_ratio)
-------------------------------
  proration_amount = (days_remaining / total_days_in_cycle) * (new_cycle_amount - old_cycle_amount)

* Positive result → upgrade  → create an Invoice for the difference
* Negative result → downgrade → create a CreditNote against the latest Invoice
* Future BillingSchedule rows are updated to the new cycle amount.
"""
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models.invoice import CreditNote, Invoice, InvoiceStatus
from app.models.quotation import QuotationLine
from app.models.subscription import BillingSchedule, ScheduleStatus, SubscriptionCadence

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


def calculate_prorated_amount(
    amount: Decimal,
    billing_start: date,
    billing_end: date,
    as_of: date | None = None,
) -> Decimal:
    """Calculate the unused portion of a billing amount from ``as_of`` onward."""
    if billing_end <= billing_start:
        raise ValueError("billing_end must be after billing_start")
    effective_date = as_of or billing_start
    if effective_date <= billing_start:
        return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if effective_date >= billing_end:
        return Decimal("0.00")
    total_days = (billing_end - billing_start).days
    remaining_days = (billing_end - effective_date).days
    return (amount * Decimal(remaining_days) / Decimal(total_days)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _total_days_in_cycle(cadence: SubscriptionCadence) -> int:
    return _DAYS_PER_CYCLE[cadence]


def _days_remaining_in_cycle(change_date: date, last_billing_date: date, cadence: SubscriptionCadence) -> int:
    """Days from change_date until the end of the current cycle."""
    cycle_end = last_billing_date + relativedelta(days=_DAYS_PER_CYCLE[cadence])
    remaining = (cycle_end - change_date).days
    return max(remaining, 0)


def _latest_billed_schedule(db: Session, line_id: int) -> Optional[BillingSchedule]:
    """Return the most-recently-scheduled (not Failed) BillingSchedule for a line."""
    return (
        db.query(BillingSchedule)
        .filter(
            BillingSchedule.quotation_line_id == line_id,
            BillingSchedule.status != ScheduleStatus.FAILED,
        )
        .order_by(BillingSchedule.billing_date.desc())
        .first()
    )


def _latest_active_schedule(db: Session, line_id: int, as_of: date) -> Optional[BillingSchedule]:
    """Return the most recent scheduled row at or before change_date."""
    return (
        db.query(BillingSchedule)
        .filter(
            BillingSchedule.quotation_line_id == line_id,
            BillingSchedule.billing_date <= as_of,
            BillingSchedule.status != ScheduleStatus.FAILED,
        )
        .order_by(BillingSchedule.billing_date.desc())
        .first()
    )


def _latest_invoice(db: Session, quotation_id: int) -> Optional[Invoice]:
    return (
        db.query(Invoice)
        .filter(Invoice.quotation_id == quotation_id)
        .order_by(Invoice.created_at.desc())
        .first()
    )


# ── public API ────────────────────────────────────────────────────────────


def compute_proration(
    db: Session,
    line: QuotationLine,
    new_plan_id: Optional[int],
    new_quantity: Optional[Decimal],
    change_date: date,
) -> dict:
    """
    Return a preview dict without persisting anything.

    Returns
    -------
    {
        "proration_amount": Decimal,    # absolute value; negative = credit
        "direction": "debit" | "credit",
        "days_remaining": int,
        "total_days_in_cycle": int,
        "old_cycle_amount": Decimal,
        "new_cycle_amount": Decimal,
    }
    """
    from app.models.subscription import SubscriptionPlan  # avoid circular

    old_plan = line.plan
    old_qty = line.quantity
    old_price = old_plan.price if old_plan else Decimal("0")
    old_cycle_amount = (old_price * old_qty).quantize(Decimal("0.01"))

    # Resolve new plan & quantity
    if new_plan_id is not None:
        new_plan = db.get(SubscriptionPlan, new_plan_id)
        if new_plan is None:
            raise ValueError(f"SubscriptionPlan {new_plan_id} not found")
    else:
        new_plan = old_plan

    resolved_qty = new_quantity if new_quantity is not None else old_qty
    new_cycle_amount = (new_plan.price * resolved_qty).quantize(Decimal("0.01"))

    cadence = new_plan.cadence
    total_days = _total_days_in_cycle(cadence)

    # Find last billing date for this line
    active_sched = _latest_active_schedule(db, line.id, change_date)
    if active_sched:
        last_billing_date = active_sched.billing_date
    else:
        last_billing_date = change_date  # treat today as start of cycle

    days_remaining = _days_remaining_in_cycle(change_date, last_billing_date, cadence)

    raw = (Decimal(days_remaining) / Decimal(total_days)) * (new_cycle_amount - old_cycle_amount)
    proration_amount = raw.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    direction = "debit" if proration_amount >= 0 else "credit"

    return {
        "proration_amount": abs(proration_amount),
        "direction": direction,
        "days_remaining": days_remaining,
        "total_days_in_cycle": total_days,
        "old_cycle_amount": old_cycle_amount,
        "new_cycle_amount": new_cycle_amount,
        "_raw_proration": proration_amount,  # signed, used internally
        "_new_plan": new_plan,
        "_resolved_qty": resolved_qty,
    }


def apply_proration(
    db: Session,
    line: QuotationLine,
    new_plan_id: Optional[int],
    new_quantity: Optional[Decimal],
    change_date: date,
) -> dict:
    """
    Commit a proration change:
    - Updates QuotationLine.plan_id, quantity, unit_price, line_total
    - Updates future BillingSchedule amounts
    - Creates an Invoice (upgrade) or CreditNote (downgrade)

    Returns the preview dict augmented with invoice/credit_note ids.
    """
    preview = compute_proration(db, line, new_plan_id, new_quantity, change_date)
    raw_proration: Decimal = preview["_raw_proration"]
    new_plan = preview["_new_plan"]
    resolved_qty: Decimal = preview["_resolved_qty"]

    # 1. Update the quotation line
    if new_plan_id is not None:
        line.plan_id = new_plan.id
    line.quantity = resolved_qty
    line.unit_price = new_plan.price
    line.line_total = (new_plan.price * resolved_qty * (1 - line.discount_percent / 100)).quantize(Decimal("0.01"))
    db.add(line)

    # 2. Update future BillingSchedule rows
    future_scheds = (
        db.query(BillingSchedule)
        .filter(
            BillingSchedule.quotation_line_id == line.id,
            BillingSchedule.billing_date > change_date,
            BillingSchedule.status == ScheduleStatus.SCHEDULED,
        )
        .all()
    )
    new_cycle_amount = preview["new_cycle_amount"]
    for sched in future_scheds:
        sched.amount = new_cycle_amount
        db.add(sched)

    # 3. Generate financial document
    invoice_id: Optional[int] = None
    credit_note_id: Optional[int] = None

    if raw_proration > 0:
        # Upgrade: issue a debit invoice
        inv = Invoice(
            quotation_id=line.quotation_id,
            amount=abs(raw_proration),
            status=InvoiceStatus.UNPAID,
        )
        db.add(inv)
        db.flush()
        invoice_id = inv.id
    elif raw_proration < 0:
        # Downgrade: issue a credit note against latest invoice
        latest_inv = _latest_invoice(db, line.quotation_id)
        if latest_inv:
            cn = CreditNote(
                invoice_id=latest_inv.id,
                amount=abs(raw_proration),
                reason=f"Proration credit for plan/quantity change on line {line.id}",
            )
            db.add(cn)
            db.flush()
            credit_note_id = cn.id

    db.commit()

    result = {k: v for k, v in preview.items() if not k.startswith("_")}
    result["invoice_id"] = invoice_id
    result["credit_note_id"] = credit_note_id
    return result
