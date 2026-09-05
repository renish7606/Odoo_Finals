"""Expose protected price-list endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.pricing import PriceList, PriceListEntry
from app.models.product import Product, Variant
from app.schemas.pricing import PriceEntryCreate, PriceListCreate

router = APIRouter(prefix="/price-lists", tags=["price lists"])
@router.get("")
def list_price_lists(db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List all price lists.""";return db.scalars(select(PriceList)).all()
@router.post("")
def create_price_list(data:PriceListCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Create one tier price list."""
    # Reject duplicate names before they reach the database constraint.
    if db.scalar(select(PriceList).where(PriceList.name == data.name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Price list name is already in use")
    item=PriceList(
        name=data.name,
        customer_tier=data.customer_tier,
        currency=data.currency,
        effective_from=data.effective_from,
        effective_to=data.effective_to,
    )
    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Price list name is already in use") from exc
    db.refresh(item)
    return item
@router.post("/{price_list_id}/entries")
def add_entry(price_list_id:int,data:PriceEntryCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Add one exact price override."""
    if not db.get(PriceList, price_list_id):
        raise HTTPException(status_code=404, detail="Price list was not found")

    if not db.get(Product, data.product_id):
        raise HTTPException(status_code=404, detail="Product was not found")

    if data.variant_id is not None:
        variant = db.get(Variant, data.variant_id)
        if variant is None:
            raise HTTPException(status_code=404, detail="Variant was not found")
        if variant.product_id != data.product_id:
            raise HTTPException(
                status_code=400,
                detail="Variant does not belong to the selected product",
            )

    item = PriceListEntry(
        price_list_id=price_list_id,
        product_id=data.product_id,
        variant_id=data.variant_id,
        resolved_price=data.resolved_price,
    )
    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This product variant already has an entry in the price list",
        ) from exc
    db.refresh(item)
    return item
@router.get("/{price_list_id}/entries")
def list_entries(price_list_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List prices in one list.""";return db.scalars(select(PriceListEntry).where(PriceListEntry.price_list_id==price_list_id)).all()
