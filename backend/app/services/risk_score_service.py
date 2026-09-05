"""Calculate the required revenue-weighted blended risk score."""
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.quotation import Quotation, QuotationLine
from app.services.discount_validation_service import validate_line_discount

def blended_risk_score(quotation_id:int, db:Session)->Decimal:
    """Aggregate every line overage by its pre-discount revenue weight."""
    quotation=db.get(Quotation,quotation_id)
    if quotation is None: raise ValueError("Quotation was not found")
    lines=db.scalars(select(QuotationLine).where(QuotationLine.quotation_id==quotation_id)).all()
    values=[validate_line_discount(line,quotation.customer,db) for line in lines]
    total=sum((item.pre_discount_total for item in values),Decimal("0"))
    if total==0:return Decimal("0")
    return sum((item.overage*item.pre_discount_total/total for item in values),Decimal("0"))
