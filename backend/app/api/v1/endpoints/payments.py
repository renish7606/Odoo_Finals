from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.billing import InvoiceDetailOut, InvoiceOut, PaymentCreate, PaymentOut
from app.services import billing_service

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/invoices", response_model=List[InvoiceOut])
def list_invoices(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """List all invoices."""
    return db.query(Invoice).all()


@router.get("/invoices/{invoice_id}", response_model=InvoiceDetailOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get invoice details by ID, including payments and credit notes."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.post("/invoices/{invoice_id}/pay", response_model=PaymentOut)
def pay_invoice(
    invoice_id: int,
    payment_in: PaymentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Record a payment against an invoice (mock/simulated)."""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        
    try:
        payment = billing_service.record_payment(
            db=db,
            invoice=invoice,
            amount=payment_in.amount,
            reference=payment_in.reference
        )
        return payment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
