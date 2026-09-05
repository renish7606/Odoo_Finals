"""Billing service: order totals calculation, schedule generation, and payment recording."""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.models.invoice import Invoice, InvoiceStatus, Payment
from app.models.quotation import Quotation
from app.models.subscription import BillingSchedule, ScheduleStatus, SubscriptionCadence, SubscriptionPlan


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _cadence_to_periods(cadence: SubscriptionCadence) -> int:
    """Return the number of billing cycles in a 1-year horizon."""
    return {
        SubscriptionCadence.MONTHLY: 12,
        SubscriptionCadence.QUARTERLY: 4,
        SubscriptionCadence.YEARLY: 1,
    }[cadence]


def _monthly_divisor(cadence: SubscriptionCadence) -> int:
    """Months per billing cycle, used to compute monthly equivalents."""
    return {
        SubscriptionCadence.MONTHLY: 1,
        SubscriptionCadence.QUARTERLY: 3,
        SubscriptionCadence.YEARLY: 12,
    }[cadence]


def _next_billing_date(start: date, cadence: SubscriptionCadence, period: int) -> date:
    """Compute the billing date for the nth period after start (0-indexed)."""
    if cadence == SubscriptionCadence.MONTHLY:
        return start + relativedelta(months=period)
    elif cadence == SubscriptionCadence.QUARTERLY:
        return start + relativedelta(months=3 * period)
    else:  # yearly
        return start + relativedelta(years=period)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def calculate_order_totals(quotation: Quotation) -> dict:
    """
    Separate one-time and recurring quotation lines and compute totals.

    Takes an already-loaded Quotation ORM object.

    Returns a dict with keys:
      - quotation_id
      - one_time_total
      - recurring_total_per_cycle         (sum of all recurring line_totals)
      - recurring_monthly_equivalent       (normalised to a monthly amount)
      - recurring_subtotals_by_cadence     (dict: cadence_value → subtotal)
      - grand_total_immediate              (one_time + sum of first-cycle recurring)
      - grand_total                        (alias for grand_total_immediate)
      - lines                              (list of per-line breakdown dicts)
    """
    lines_out = []
    one_time_total = Decimal("0")
    recurring_subtotals: dict[str, Decimal] = {}
    monthly_equivalent = Decimal("0")

    for line in quotation.lines:
        is_recurring = line.plan_id is not None
        lines_out.append(
            {
                "quotation_line_id": line.id,
                "product_id": line.product_id,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "discount_percent": line.discount_percent,
                "line_total": line.line_total,
                "is_recurring": is_recurring,
                "plan_id": line.plan_id,
            }
        )

        if not is_recurring:
            one_time_total += line.line_total
        else:
            # We need the plan cadence for the monthly equivalent
            plan: Optional[SubscriptionPlan] = line.plan
            cadence_value = plan.cadence.value if plan else "monthly"
            cadence = plan.cadence if plan else SubscriptionCadence.MONTHLY
            divisor = _monthly_divisor(cadence)

            recurring_subtotals[cadence_value] = (
                recurring_subtotals.get(cadence_value, Decimal("0")) + line.line_total
            )
            monthly_equivalent += (line.line_total / Decimal(divisor)).quantize(Decimal("0.01"))

    recurring_total_per_cycle = sum(recurring_subtotals.values(), Decimal("0"))
    grand_total_immediate = one_time_total + recurring_total_per_cycle

    return {
        "quotation_id": quotation.id,
        "one_time_total": one_time_total,
        "recurring_total_per_cycle": recurring_total_per_cycle,
        "recurring_monthly_equivalent": monthly_equivalent,
        "recurring_subtotals_by_cadence": recurring_subtotals,
        "grand_total_immediate": grand_total_immediate,
        "grand_total": grand_total_immediate,  # alias used by OrderTotalsOut schema
        "lines": lines_out,
    }


def generate_billing_schedule(
    db: Session,
    quotation: Quotation,
    start_date: Optional[date] = None,
) -> Invoice:
    """
    Generate BillingSchedule rows for all recurring lines in the quotation
    and create an initial Invoice for the immediate (first-cycle + one-time) amount.

    Returns the created Invoice ORM object.
    Raises ValueError if there is nothing to charge.
    """
    if start_date is None:
        start_date = date.today()

    immediate_amount = Decimal("0")

    for line in quotation.lines:
        if line.plan_id is None:
            # One-time line: add full amount to the initial invoice
            immediate_amount += line.line_total
            continue

        plan: Optional[SubscriptionPlan] = db.get(SubscriptionPlan, line.plan_id)
        if plan is None:
            continue

        periods = _cadence_to_periods(plan.cadence)
        for period in range(periods):
            billing_date = _next_billing_date(start_date, plan.cadence, period)
            schedule = BillingSchedule(
                quotation_line_id=line.id,
                plan_id=plan.id,
                billing_date=billing_date,
                amount=line.line_total,
                status=ScheduleStatus.SCHEDULED,
            )
            db.add(schedule)

            # First cycle is immediately due
            if period == 0:
                immediate_amount += line.line_total

    if immediate_amount <= Decimal("0"):
        raise ValueError("No chargeable amount found; quotation has no lines with positive totals")

    invoice = Invoice(
        quotation_id=quotation.id,
        amount=immediate_amount,
        status=InvoiceStatus.UNPAID,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def record_payment(
    db: Session,
    invoice: Invoice,
    amount: Decimal,
    reference: Optional[str] = None,
) -> Payment:
    """
    Record a payment against an already-loaded Invoice ORM object.

    Raises ValueError if the payment amount exceeds the remaining balance.
    Updates invoice status to Paid or PartiallyPaid based on total payments.
    """
    db.refresh(invoice)
    total_paid_so_far = sum(p.amount for p in invoice.payments)
    total_credited = sum(c.amount for c in invoice.credit_notes)
    remaining = invoice.amount - total_paid_so_far - total_credited

    if amount > remaining:
        raise ValueError(
            f"Payment amount {amount} exceeds remaining balance {remaining}"
        )

    payment = Payment(invoice_id=invoice.id, amount=amount, reference=reference)
    db.add(payment)
    db.flush()

    # Reload payments to get the just-added record included
    db.refresh(invoice)
    total_paid = sum(p.amount for p in invoice.payments)
    if total_paid + total_credited >= invoice.amount:
        invoice.status = InvoiceStatus.PAID
    else:
        invoice.status = InvoiceStatus.PARTIALLY_PAID

    db.commit()
    db.refresh(payment)
    return payment
