from __future__ import annotations

from datetime import datetime, date
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api import deps
from app.models.customer import Customer, CustomerTier
from app.models.invoice import Invoice, InvoiceStatus, Payment
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.user import User
from app.services import billing_service
from app.services.pdf_service import generate_invoice_pdf

router = APIRouter(prefix="/payments", tags=["payments"])


class PaymentIn(BaseModel):
    amount: Optional[Decimal] = None
    reference: Optional[str] = Field("WIRE-DIRECT-RECON", max_length=255)


def _ensure_seed_invoices(db: Session) -> None:
    """Ensure sample corporate invoices exist if table is empty."""
    try:
<<<<<<< HEAD
        query = db.query(Invoice)
        if not hasattr(query, "count"):
            return
        if query.count() > 0:
=======
        existing = db.query(Invoice).all()
        if existing:
>>>>>>> 57e7eed (Add minor changes)
            return
    except Exception:
        return

    # Look for existing quotation or customer
    quotations = db.query(Quotation).all()
    q_id = quotations[0].id if quotations else 1

    sample_invoices = [
        {
            "amount": Decimal("260925.00"),
            "status": InvoiceStatus.UNPAID,
            "ref": "INV-2024-1101",
            "due": "Oct 28, 2024",
            "customer": "Starlight Dynamics Inc.",
            "deal_ref": "DEAL-8492",
            "milestone": "Series B Expansion",
        },
        {
            "amount": Decimal("130000.00"),
            "status": InvoiceStatus.PAID,
            "ref": "INV-2024-1102",
            "due": "Oct 1, 2024",
            "customer": "Nexus Health Systems",
            "deal_ref": "DEAL-8488",
            "milestone": "Series B Milestone",
        },
        {
            "amount": Decimal("45000.00"),
            "status": InvoiceStatus.UNPAID,
            "ref": "INV-2024-1103",
            "due": "Oct 15, 2024",
            "customer": "Vanguard Logistics International",
            "deal_ref": "DEAL-8475",
            "milestone": "Q3 Infrastructure",
        },
        {
            "amount": Decimal("222500.00"),
            "status": InvoiceStatus.UNPAID,
            "ref": "INV-2024-1104",
            "due": "Nov 1, 2024",
            "customer": "AeroSphere Aerospace Holdings",
            "deal_ref": "DEAL-8461",
            "milestone": "Advisory Mandate Phase I",
        },
        {
            "amount": Decimal("89200.00"),
            "status": InvoiceStatus.UNPAID,
            "ref": "INV-2024-1100",
            "due": "Sep 15, 2024",
            "customer": "Borealis CleanTech JV",
            "deal_ref": "DEAL-8450",
            "milestone": "Escrow Release Tier 3",
        },
    ]

    for item in sample_invoices:
        inv = Invoice(
            quotation_id=q_id,
            amount=item["amount"],
            status=item["status"],
        )
        db.add(inv)
        db.flush()

        if item["status"] == InvoiceStatus.PAID:
            pay = Payment(
                invoice_id=inv.id,
                amount=item["amount"],
                reference="CHASE-ACH-SETTLED",
                paid_at=datetime.now(),
            )
            db.add(pay)

    db.commit()


def _build_invoice_dict(inv: Invoice) -> Dict[str, Any]:
    """Format rich dictionary for invoice list and detail view."""
    # Mapping demo metadata based on invoice ID
    meta_map = {
        1: {
            "number": "INV-2024-1101",
            "customer_name": "Starlight Dynamics Inc.",
            "customer_address": "850 Third Avenue, Fl 14, New York, NY 10022",
            "tax_id": "EIN: US-94829104",
            "deal_ref": "DEAL-8492",
            "milestone": "Series B Expansion",
            "icon": "verified_user",
            "due_date": "Oct 28, 2024",
            "issued_date": "Sept 28, 2024",
            "lines": [
                {"description": "Enterprise Cloud Tier x120", "milestone": "Q3-DRAW", "amount": 127500},
                {"description": "Integration & API Gateway Provisioning", "milestone": "ONE-TIME", "amount": 40500},
                {"description": "Premium 24/7 SLA Support Tier", "milestone": "ANNUAL", "amount": 56000},
                {"description": "Cloud Infrastructure Compliance Fee", "milestone": "RECURRING", "amount": 21000},
            ],
        },
        2: {
            "number": "INV-2024-1102",
            "customer_name": "Nexus Health Systems",
            "customer_address": "1200 Healthcare Plaza, Suite 500, Boston, MA 02115",
            "tax_id": "EIN: US-81729341",
            "deal_ref": "DEAL-8488",
            "milestone": "Series B Milestone",
            "icon": "receipt_long",
            "due_date": "Oct 1, 2024",
            "issued_date": "Sep 1, 2024",
            "lines": [
                {"description": "Healthcare Core Protocol Integration", "milestone": "PHASE-1", "amount": 85000},
                {"description": "HIPAA Tier-3 Compliance Sandbox", "milestone": "ANNUAL", "amount": 45000},
            ],
        },
        3: {
            "number": "INV-2024-1103",
            "customer_name": "Vanguard Logistics International",
            "customer_address": "400 Terminal Way, Long Beach, CA 90802",
            "tax_id": "EIN: US-71829304",
            "deal_ref": "DEAL-8475",
            "milestone": "Q3 Infrastructure",
            "icon": "local_shipping",
            "due_date": "Oct 15, 2024",
            "issued_date": "Sep 15, 2024",
            "lines": [
                {"description": "Fleet Telemetry Ingestion Node", "milestone": "Q3-DRAW", "amount": 30000},
                {"description": "Cold-Chain Sensor API Connectors", "milestone": "ONE-TIME", "amount": 15000},
            ],
        },
        4: {
            "number": "INV-2024-1104",
            "customer_name": "AeroSphere Aerospace Holdings",
            "customer_address": "100 Aerospace Blvd, Seattle, WA 98108",
            "tax_id": "EIN: US-62918234",
            "deal_ref": "DEAL-8461",
            "milestone": "Advisory Mandate Phase I",
            "icon": "flight_takeoff",
            "due_date": "Nov 1, 2024",
            "issued_date": "Oct 1, 2024",
            "lines": [
                {"description": "Flight Operations Control SaaS License", "milestone": "ANNUAL", "amount": 150000},
                {"description": "Mission Assurance Engineering Services", "milestone": "MILESTONE", "amount": 72500},
            ],
        },
        5: {
            "number": "INV-2024-1100",
            "customer_name": "Borealis CleanTech JV",
            "customer_address": "55 Clean Energy Way, Denver, CO 80202",
            "tax_id": "EIN: US-51928374",
            "deal_ref": "DEAL-8450",
            "milestone": "Escrow Release Tier 3",
            "icon": "corporate_fare",
            "due_date": "Sep 15, 2024",
            "issued_date": "Aug 15, 2024",
            "lines": [
                {"description": "Renewables Grid Inverter Software", "milestone": "ESCROW-T3", "amount": 89200},
            ],
        },
    }

    meta = meta_map.get(inv.id, {
        "number": f"INV-2024-{1100 + inv.id}",
        "customer_name": (inv.quotation.customer.name if inv.quotation and inv.quotation.customer else "Enterprise Account"),
        "customer_address": "850 Third Avenue, Fl 14, New York, NY 10022",
        "tax_id": "EIN: US-94829104",
        "deal_ref": f"DEAL-{8400 + inv.id}",
        "milestone": "Commercial Scope",
        "icon": "receipt_long",
        "due_date": "Net 30 Days",
        "issued_date": inv.created_at.strftime("%b %d, %Y") if inv.created_at else "Sept 28, 2024",
        "lines": [
            {"description": "Enterprise Platform Core Scope", "milestone": "MILESTONE", "amount": float(inv.amount)},
        ],
    })

    payments_list = []
    for p in inv.payments:
        payments_list.append({
            "id": p.id,
            "amount": float(p.amount),
            "reference": p.reference or f"PAY-{p.id}",
            "paid_at": p.paid_at.strftime("%b %d, %Y") if p.paid_at else "Immediate",
        })

    # Status string
    st_val = inv.status.value if hasattr(inv.status, "value") else str(inv.status)
    # If payments equal or exceed amount, status is Paid
    total_paid = sum(Decimal(str(p["amount"])) for p in payments_list)
    if total_paid >= inv.amount:
        st_val = "Paid"

    return {
        "id": inv.id,
        "quotation_id": inv.quotation_id,
        "number": meta["number"],
        "deal_ref": meta["deal_ref"],
        "customer_name": meta["customer_name"],
        "customer_address": meta["customer_address"],
        "tax_id": meta["tax_id"],
        "milestone": meta["milestone"],
        "icon": meta["icon"],
        "amount": float(inv.amount),
        "status": st_val,
        "due_date": meta["due_date"],
        "issued_date": meta["issued_date"],
        "created_at": inv.created_at.strftime("%b %d, %Y") if inv.created_at else meta["issued_date"],
        "lines": meta["lines"],
        "payments": payments_list,
        "total_paid": float(total_paid),
        "balance_due": max(0.0, float(inv.amount - total_paid)),
    }


@router.get("/invoices")
def list_invoices(
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_optional_current_user),
) -> List[Dict[str, Any]]:
    """List all corporate invoices with rich metadata."""
    _ensure_seed_invoices(db)
    invoices = db.query(Invoice).order_by(Invoice.id.asc()).all()
    return [_build_invoice_dict(inv) for inv in invoices]


@router.get("/invoices/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_optional_current_user),
) -> Dict[str, Any]:
    """Get invoice details by ID, including payments and line items."""
    _ensure_seed_invoices(db)
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return _build_invoice_dict(invoice)


@router.post("/invoices/{invoice_id}/pay")
def pay_invoice(
    invoice_id: int,
    payment_in: PaymentIn,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_optional_current_user),
) -> Dict[str, Any]:
    """
    Record a payment against an invoice in the separate Payment table.
    Updates Invoice status to Paid or PartiallyPaid.
    """
    _ensure_seed_invoices(db)
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    # Determine amount
<<<<<<< HEAD
    total_paid_so_far = sum(p.amount for p in invoice.payments) + sum(c.amount for c in getattr(invoice, "credit_notes", []))
=======
    total_credits = sum(cn.amount for cn in (getattr(invoice, "credit_notes", []) or []))
    total_paid_so_far = sum(p.amount for p in invoice.payments) + total_credits
>>>>>>> 57e7eed (Add minor changes)
    remaining = invoice.amount - total_paid_so_far
    amount_to_pay = payment_in.amount if (payment_in.amount and payment_in.amount > 0) else remaining

    if amount_to_pay <= Decimal("0"):
        amount_to_pay = invoice.amount

    # Create record in separate Payment table
    payment = Payment(
        invoice_id=invoice.id,
        amount=amount_to_pay,
        reference=payment_in.reference or "WIRE-DIRECT-RECON",
        paid_at=datetime.now(),
    )
    db.add(payment)
    db.flush()

    # Update invoice status
    db.refresh(invoice)
<<<<<<< HEAD
    total_paid = sum(p.amount for p in invoice.payments) + sum(c.amount for c in getattr(invoice, "credit_notes", []))
=======
    total_paid = sum(p.amount for p in invoice.payments) + total_credits
>>>>>>> 57e7eed (Add minor changes)
    if total_paid >= invoice.amount:
        invoice.status = InvoiceStatus.PAID
    else:
        invoice.status = InvoiceStatus.PARTIALLY_PAID

    db.commit()
    db.refresh(payment)
    db.refresh(invoice)

    return {
        "success": True,
        "payment": {
            "id": payment.id,
            "invoice_id": payment.invoice_id,
            "amount": float(payment.amount),
            "reference": payment.reference,
            "paid_at": payment.paid_at.strftime("%b %d, %Y %H:%M"),
        },
        "invoice": _build_invoice_dict(invoice),
    }


@router.get("/invoices/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Optional[User] = Depends(deps.get_optional_current_user),
) -> Response:
    """
    Generate and download a high-assurance executive PDF summary of the invoice using ReportLab.
    """
    _ensure_seed_invoices(db)
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    inv_data = _build_invoice_dict(invoice)
    pdf_bytes = generate_invoice_pdf(inv_data)

    filename = f"DealFlow360_Invoice_{inv_data.get('number', invoice_id)}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )
