"""Expose protected price-list endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.pricing import PriceList, PriceListEntry
from app.schemas.pricing import PriceEntryCreate, PriceListCreate
router=APIRouter(prefix="/price-lists",tags=["price lists"])
@router.get("")
def list_price_lists(db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List all price lists.""";return db.scalars(select(PriceList)).all()
@router.post("")
def create_price_list(data:PriceListCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Create one tier price list."""
    item=PriceList(**data.model_dump());db.add(item);db.commit();db.refresh(item);return item
@router.post("/{price_list_id}/entries")
def add_entry(price_list_id:int,data:PriceEntryCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Add one exact price override."""
    if not db.get(PriceList,price_list_id):raise HTTPException(404,"Price list was not found")
    item=PriceListEntry(price_list_id=price_list_id,product_id=data.product_id,variant_id=data.variant_id,resolved_price=data.resolved_price);db.add(item);db.commit();db.refresh(item);return item
@router.get("/{price_list_id}/entries")
def list_entries(price_list_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List prices in one list.""";return db.scalars(select(PriceListEntry).where(PriceListEntry.price_list_id==price_list_id)).all()
