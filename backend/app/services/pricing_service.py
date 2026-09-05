"""Resolve prices without returning unsafe zero values."""
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.pricing import PriceList, PriceListEntry
from app.models.product import Product, Variant
from app.models.customer import CustomerTier

class PriceNotResolvableError(ValueError):
    """Raised when a requested product has no usable price."""
@dataclass(frozen=True)
class ResolvedPrice:
    """Return both the final price and its source."""
    amount: Decimal
    source: str
def resolve_price(product_id:int, variant_id:int|None, customer_tier:CustomerTier, currency:str, db:Session) -> ResolvedPrice:
    """Use an active exact list entry, otherwise use the product fallback."""
    today=date.today()
    lists=db.scalars(select(PriceList).where(PriceList.customer_tier==customer_tier,PriceList.currency==currency,PriceList.effective_from<=today,or_(PriceList.effective_to.is_(None),PriceList.effective_to>=today)).order_by(PriceList.effective_from.desc())).all()
    for price_list in lists:
        entry=db.scalar(select(PriceListEntry).where(PriceListEntry.price_list_id==price_list.id,PriceListEntry.product_id==product_id,PriceListEntry.variant_id==variant_id))
        if entry: return ResolvedPrice(entry.resolved_price,"price_list")
    product=db.get(Product,product_id)
    if product is None or not product.is_active: raise PriceNotResolvableError("No active product price is available")
    extra=Decimal("0")
    if variant_id is not None:
        variant=db.get(Variant,variant_id)
        if variant is None or variant.product_id!=product.id: raise PriceNotResolvableError("Variant does not belong to the product")
        extra=variant.extra_price
    return ResolvedPrice(product.base_price+extra,"base_price")
