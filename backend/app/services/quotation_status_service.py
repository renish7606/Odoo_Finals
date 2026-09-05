"""Enforce valid shared quotation state changes."""
from sqlalchemy.orm import Session
from app.models.quotation import Quotation, QuotationStatus
class InvalidStatusTransitionError(ValueError):
    """Raised when a caller skips a required state."""
_allowed={QuotationStatus.DRAFT:{QuotationStatus.APPROVED,QuotationStatus.REJECTED},QuotationStatus.APPROVED:{QuotationStatus.SENT},QuotationStatus.SENT:{QuotationStatus.UNDER_NEGOTIATION},QuotationStatus.UNDER_NEGOTIATION:{QuotationStatus.CONFIRMED},QuotationStatus.CONFIRMED:{QuotationStatus.FULFILLED},QuotationStatus.REJECTED:{QuotationStatus.DRAFT}}
def transition(quotation_id:int,new_status:QuotationStatus,actor,db:Session)->Quotation:
    """Move one quotation only through an allowed next state."""
    quotation=db.get(Quotation,quotation_id)
    if quotation is None: raise InvalidStatusTransitionError("Quotation was not found")
    if new_status not in _allowed.get(quotation.status,set()): raise InvalidStatusTransitionError("This quotation status change is not allowed")
    quotation.status=new_status; db.flush(); return quotation
