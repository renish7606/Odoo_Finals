"""Check each quotation line against its strictest discount ceiling."""
from dataclasses import dataclass
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.discount import CategoryDiscountCeiling, DiscountTier
from app.models.product import Product
from app.models.quotation import QuotationLine

@dataclass(frozen=True)
class LineDiscountResult:
    """Describe one line's ceiling and overage."""
    line_id:int; ceiling:Decimal; overage:Decimal; pre_discount_total:Decimal
def validate_line_discount(line:QuotationLine, customer:Customer, db:Session)->LineDiscountResult:
    """Apply the tier ceiling and any stricter category ceiling."""
    tier=db.scalar(select(DiscountTier).where(DiscountTier.customer_tier==customer.tier))
    if tier is None: raise ValueError("No discount tier is configured for this customer")
    product=db.get(Product,line.product_id)
    ceiling=tier.max_discount_percent
    category=db.scalar(select(CategoryDiscountCeiling).where(CategoryDiscountCeiling.category==product.category)) if product else None
    if category: ceiling=min(ceiling,category.max_discount_percent)
    return LineDiscountResult(line.id,ceiling,max(Decimal("0"),line.discount_percent-ceiling),line.unit_price*line.quantity)
