"""Pydantic schemas for billing totals, invoices, payments, credit notes, and schedules."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator

from app.models.invoice import InvoiceStatus
from app.models.subscription import ScheduleStatus


# ──────────────────────────────────────────────
# Order Totals (one-time vs recurring breakdown)
# ──────────────────────────────────────────────

class LineBreakdownItem(BaseModel):
    """Summary of a single quotation line in the order totals response."""
    quotation_line_id: int
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    discount_percent: Decimal
    line_total: Decimal
    is_recurring: bool
    plan_id: Optional[int]

    model_config = {"from_attributes": True}


class OrderTotalsOut(BaseModel):
    """
    Separated breakdown of one-time and recurring costs for a quotation.

    Exposes both naming styles so API consumers and tests are satisfied:
      - grand_total / grand_total_immediate  (same value)
      - recurring_total_per_cycle / recurring_monthly_equivalent
    """
    quotation_id: int
    one_time_total: Decimal
    # Per-cycle total (sum across all cadences, each at its own rate)
    recurring_total_per_cycle: Decimal
    # Normalised monthly equivalent (quarterly÷3, yearly÷12)
    recurring_monthly_equivalent: Decimal = Decimal("0")
    # Per-cadence subtotals dict  {"monthly": ..., "quarterly": ..., ...}
    recurring_subtotals_by_cadence: Dict[str, Decimal] = Field(default_factory=dict)
    # Immediate charge = one-time + first-cycle recurring
    grand_total_immediate: Decimal = Decimal("0")
    # Alias kept for API consumer convenience
    grand_total: Decimal = Decimal("0")
    lines: List[LineBreakdownItem]

    @model_validator(mode="before")
    @classmethod
    def _fill_aliases(cls, data: Any) -> Any:
        """Back-fill alias fields from canonical ones when not explicitly provided."""
        if isinstance(data, dict):
            # grand_total / grand_total_immediate are both the same
            if "grand_total" not in data and "grand_total_immediate" in data:
                data["grand_total"] = data["grand_total_immediate"]
            if "grand_total_immediate" not in data and "grand_total" in data:
                data["grand_total_immediate"] = data["grand_total"]
            # recurring_monthly_equivalent → recurring_total_per_cycle fallback
            if "recurring_monthly_equivalent" not in data:
                data["recurring_monthly_equivalent"] = data.get("recurring_total_per_cycle", Decimal("0"))
        return data


# ──────────────────────────────────────────────
# Billing Schedule
# ──────────────────────────────────────────────

class BillingScheduleOut(BaseModel):
    id: int
    quotation_line_id: int
    plan_id: int
    billing_date: date
    amount: Decimal
    status: ScheduleStatus

    model_config = {"from_attributes": True}


class GenerateScheduleOut(BaseModel):
    """Result of generating billing schedules for a quotation."""
    quotation_id: int
    schedules_created: int
    invoice_id: Optional[int]
    invoice_amount: Optional[Decimal]


# ──────────────────────────────────────────────
# Payment
# ──────────────────────────────────────────────

class PaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    reference: Optional[str] = Field(None, max_length=255)


class PaymentOut(BaseModel):
    id: int
    invoice_id: int
    amount: Decimal
    paid_at: datetime
    reference: Optional[str]

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Credit Note
# ──────────────────────────────────────────────

class CreditNoteOut(BaseModel):
    id: int
    invoice_id: int
    amount: Decimal
    reason: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Invoice
# ──────────────────────────────────────────────

class InvoiceOut(BaseModel):
    id: int
    quotation_id: int
    amount: Decimal
    status: InvoiceStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceDetailOut(BaseModel):
    """Full invoice view including payments and credit notes."""
    id: int
    quotation_id: int
    amount: Decimal
    status: InvoiceStatus
    created_at: datetime
    payments: List[PaymentOut] = []
    credit_notes: List[CreditNoteOut] = []

    model_config = {"from_attributes": True}
