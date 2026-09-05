"""Billing endpoints: order totals, schedule generation, invoice and payment management."""
from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import DbSession, get_current_user, require_role
from app.models.invoice import Invoice
from app.models.quotation import Quotation
from app.models.subscription import BillingSchedule
from app.models.user import User
from app.schemas.billing import (
    InvoiceDetailOut,
    InvoiceOut,
    OrderTotalsOut,
    PaymentCreate,
    PaymentOut,
)
from app.schemas.subscription import BillingScheduleOut
from app.services import billing_service

router = APIRouter(prefix="/billing", tags=["billing"])


def _get_quotation_or_404(db: Session, quotation_id: int) -> Quotation:
    q = db.get(Quotation, quotation_id)
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    return q


# ─────────────────────────────────────────────────────────────────────────────
# Order totals
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/quotations/{quotation_id}/totals", response_model=OrderTotalsOut)
def get_order_totals(
    quotation_id: int,
    db: DbSession,
    _: User = Depends(get_current_user),
) -> OrderTotalsOut:
    """
    Return separated one-time vs recurring totals for a quotation.
    """
    quotation = _get_quotation_or_404(db, quotation_id)
    totals = billing_service.calculate_order_totals(quotation)
    return OrderTotalsOut(**totals)


# ─────────────────────────────────────────────────────────────────────────────
# Billing schedule generation
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/quotations/{quotation_id}/generate-schedule", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def generate_schedule(
    quotation_id: int,
    db: DbSession,
    _: User = Depends(require_role("Admin", "SalesManager")),
    start_date: Optional[date] = None,
) -> InvoiceOut:
    """
    Generate a 1-year billing schedule for recurring lines and create an initial Invoice.
    """
    quotation = _get_quotation_or_404(db, quotation_id)
    invoice = billing_service.generate_billing_schedule(db, quotation, start_date)
    return invoice


@router.get("/quotations/{quotation_id}/schedules", response_model=List[BillingScheduleOut])
def get_billing_schedules(
    quotation_id: int,
    db: DbSession,
    _: User = Depends(get_current_user),
) -> List[BillingScheduleOut]:
    """
    List all billing schedule items for a quotation's recurring lines.
    """
    quotation = _get_quotation_or_404(db, quotation_id)
    line_ids = [ln.id for ln in quotation.lines if ln.plan_id is not None]
    if not line_ids:
        return []
    schedules = (
        db.query(BillingSchedule)
        .filter(BillingSchedule.quotation_line_id.in_(line_ids))
        .order_by(BillingSchedule.billing_date)
        .all()
    )
    return schedules


# ─────────────────────────────────────────────────────────────────────────────
# Invoices
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/invoices", response_model=List[InvoiceOut])
def list_invoices(
    db: DbSession,
    _: User = Depends(get_current_user),
) -> List[InvoiceOut]:
    """List all invoices."""
    return db.query(Invoice).order_by(Invoice.created_at.desc()).all()


@router.get("/invoices/{invoice_id}", response_model=InvoiceDetailOut)
def get_invoice(
    invoice_id: int,
    db: DbSession,
    _: User = Depends(get_current_user),
) -> InvoiceDetailOut:
    """Retrieve an invoice with its payment history and credit notes."""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


# ─────────────────────────────────────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────────────────────────────────────


@router.post("/invoices/{invoice_id}/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def record_payment(
    invoice_id: int,
    payload: PaymentCreate,
    db: DbSession,
    _: User = Depends(require_role("Admin", "FinanceOps")),
) -> PaymentOut:
    """Record a payment against an invoice."""
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    try:
        payment = billing_service.record_payment(db, invoice, payload.amount, payload.reference)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return payment
