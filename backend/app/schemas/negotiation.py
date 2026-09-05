from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel
from app.models.negotiation import NegotiationStatus, NegotiationAuthorType, NegotiationMessageType


class NegotiationMessageCreate(BaseModel):
    message_type: NegotiationMessageType
    content: str
    quotation_line_id: Optional[int] = None
    proposed_discount_percent: Optional[Decimal] = None


class NegotiationMessageResponse(BaseModel):
    id: int
    thread_id: int
    quotation_line_id: Optional[int]
    author_type: NegotiationAuthorType
    author_id: int
    message_type: NegotiationMessageType
    content: str
    proposed_discount_percent: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True


class NegotiationThreadResponse(BaseModel):
    id: int
    quotation_id: int
    status: NegotiationStatus
    opened_at: datetime
    closed_at: Optional[datetime]
    messages: List[NegotiationMessageResponse] = []

    class Config:
        from_attributes = True


class QuotationPortalResponse(BaseModel):
    # This combines quotation details and negotiation thread
    quotation_id: int
    customer_id: int
    rep_id: int
    status: str
    thread: Optional[NegotiationThreadResponse] = None

    class Config:
        from_attributes = True
