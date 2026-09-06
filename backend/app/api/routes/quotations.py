"""Quotation CRUD and line management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.customer import Customer
from app.models.product import Product
from app.models.user import User

router = APIRouter(prefix="/quotations", tags=["quotations"])


from app.models.role import Role

@router.get("")
def list_quotations(
    my_only: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all quotations with customer info and total."""
    stmt = (
        select(Quotation)
        .options(joinedload(Quotation.customer), joinedload(Quotation.lines), joinedload(Quotation.rep))
        .order_by(Quotation.created_at.desc())
    )
    if my_only and user:
        if user.role == Role.CUSTOMER:
            cust = db.scalars(select(Customer).where(Customer.email == user.email)).first()
            if cust:
                stmt = stmt.where(Quotation.customer_id == cust.id)
        else:
            stmt = stmt.where(Quotation.rep_id == user.id)

    rows = db.scalars(stmt).unique().all()
    results = []
    for q in rows:
        total = sum(float(l.line_total) for l in q.lines) if q.lines else 0.0
        results.append({
            "id": q.id,
            "deal_reference": f"DEAL-{q.id:04d}",
            "customer_id": q.customer_id,
            "customer_name": q.customer.name if q.customer else "Unknown Customer",
            "customer_email": q.customer.email if q.customer else "",
            "customer_tier": q.customer.tier.value if q.customer and hasattr(q.customer.tier, "value") else "Bronze",
            "rep_id": q.rep_id,
            "rep_name": q.rep.full_name if q.rep else "Sales Rep",
            "rep_email": q.rep.email if q.rep else "",
            "status": q.status.value,
            "line_count": len(q.lines) if q.lines else 0,
            "total_amount": total,
            "created_at": q.created_at.isoformat() if q.created_at else None,
            "updated_at": q.updated_at.isoformat() if q.updated_at else None,
        })
    return results


@router.post("", status_code=status.HTTP_201_CREATED)
def create_quotation(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new draft quotation."""
    customer_id = payload.get("customer_id")
    if not customer_id:
        # fallback to first customer if none provided
        first_cust = db.scalars(select(Customer)).first()
        if not first_cust:
            raise HTTPException(status_code=400, detail="No customer found. Please create a customer first.")
        customer_id = first_cust.id
    q = Quotation(customer_id=customer_id, rep_id=user.id, status=QuotationStatus.DRAFT)
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": q.id, "customer_id": q.customer_id, "rep_id": q.rep_id, "status": q.status.value, "deal_reference": f"DEAL-{q.id:04d}"}


@router.get("/{quotation_id}")
def get_quotation(quotation_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get a single quotation with its line items."""
    q = (
        db.scalars(
            select(Quotation)
            .options(joinedload(Quotation.customer), joinedload(Quotation.lines).joinedload(QuotationLine.product), joinedload(Quotation.rep))
            .where(Quotation.id == quotation_id)
        )
        .unique()
        .first()
    )
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    lines = q.lines or []
    total = sum(float(ln.line_total) for ln in lines) if lines else 0.0
    return {
        "id": q.id,
        "deal_reference": f"DEAL-{q.id:04d}",
        "customer_id": q.customer_id,
        "customer_name": q.customer.name if q.customer else "Unknown Customer",
        "customer_email": q.customer.email if q.customer else "",
        "customer_tier": q.customer.tier.value if q.customer and hasattr(q.customer.tier, "value") else "Bronze",
        "rep_id": q.rep_id,
        "rep_name": q.rep.full_name if q.rep else "Sales Rep",
        "status": q.status.value,
        "total_amount": total,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "updated_at": q.updated_at.isoformat() if q.updated_at else None,
        "lines": [
            {
                "id": ln.id,
                "product_id": ln.product_id,
                "product_name": ln.product.name if ln.product else f"Product #{ln.product_id}",
                "sku": ln.product.sku if ln.product else "",
                "quantity": float(ln.quantity),
                "unit_price": float(ln.unit_price),
                "discount_percent": float(ln.discount_percent) if ln.discount_percent else 0,
                "line_total": float(ln.line_total) if ln.line_total else 0,
                "category_snapshot": ln.category_snapshot or (ln.product.category if ln.product else ""),
            }
            for ln in lines
        ],
    }


from pydantic import BaseModel

class StatusUpdatePayload(BaseModel):
    status: str

class AddLinePayload(BaseModel):
    product_id: int
    quantity: float = 1.0


@router.put("/{quotation_id}")
def update_quotation_status(
    quotation_id: int,
    payload: StatusUpdatePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update a quotation's status."""
    q = db.get(Quotation, quotation_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    try:
        q.status = QuotationStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")
    db.commit()
    return {"id": q.id, "status": q.status.value}


@router.post("/{quotation_id}/lines", status_code=status.HTTP_201_CREATED)
def add_line(
    quotation_id: int,
    payload: AddLinePayload,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Add a line item to a quotation."""
    q = db.get(Quotation, quotation_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    line_total = float(product.base_price) * payload.quantity
    ln = QuotationLine(
        quotation_id=quotation_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        unit_price=product.base_price,
        discount_percent=0,
        line_total=line_total,
        category_snapshot=product.category,
    )
    db.add(ln)
    db.commit()
    db.refresh(ln)
    return {"id": ln.id, "product_id": ln.product_id, "quantity": float(ln.quantity), "line_total": float(ln.line_total)}


@router.delete("/{quotation_id}/lines/{line_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_line(
    quotation_id: int,
    line_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Remove a line item from a quotation."""
    ln = db.get(QuotationLine, line_id)
    if not ln or ln.quotation_id != quotation_id:
        raise HTTPException(status_code=404, detail="Line not found")
    db.delete(ln)
    db.commit()
