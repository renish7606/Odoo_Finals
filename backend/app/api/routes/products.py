"""Expose protected product and variant endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.product import Product, Variant
from app.schemas.product import ProductCreate, VariantCreate
router=APIRouter(prefix="/products",tags=["products"])
@router.get("")
def list_products(db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List active products for signed-in users."""
    return db.scalars(select(Product).where(Product.is_active.is_(True))).all()
@router.post("")
def create_product(data:ProductCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Create a product as an Admin."""
    # Check first so repeated Swagger requests return a clear client error.
    if db.scalar(select(Product).where(Product.name == data.name)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product name is already in use")
    item=Product(name=data.name,category=data.category,base_price=data.base_price,unit=data.unit,tax_rate=data.tax_rate,description=data.description)
    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product name is already in use") from exc
    db.refresh(item)
    return item
@router.post("/{product_id}/variants")
def create_variant(product_id:int,data:VariantCreate,db:Session=Depends(get_db),user=Depends(require_role("Admin"))):
    """Add one variant to an existing product."""
    if not db.get(Product,product_id):raise HTTPException(404,"Product was not found")
    item=Variant(product_id=product_id,attribute_name=data.attribute_name,value=data.value,extra_price=data.extra_price);db.add(item);db.commit();db.refresh(item);return item
@router.get("/{product_id}/variants")
def list_variants(product_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    """List one product's variants."""
    return db.scalars(select(Variant).where(Variant.product_id==product_id)).all()
