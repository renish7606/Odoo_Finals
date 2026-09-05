"""Recalculate line totals without unrelated writes."""
from dataclasses import dataclass
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.quotation import QuotationLine
@dataclass(frozen=True)
class QuotationTotals:
    """Return the recalculated quotation amount."""
    quotation_id:int; order_total:Decimal; margin:Decimal|None
def recompute_quotation_totals(quotation_id:int,db:Session)->QuotationTotals:
    """Recalculate every stored line total and return the order total."""
    lines=db.scalars(select(QuotationLine).where(QuotationLine.quotation_id==quotation_id)).all()
    for line in lines: line.line_total=line.unit_price*line.quantity*(Decimal("1")-line.discount_percent/Decimal("100"))
    total=sum((line.line_total for line in lines),Decimal("0")); db.flush()
    return QuotationTotals(quotation_id,total,None)
