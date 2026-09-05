from __future__ import annotations

from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class NegotiationStatus(str, Enum):
    OPEN = "Open"
    RESOLVED = "Resolved"


class NegotiationAuthorType(str, Enum):
    CUSTOMER = "Customer"
    REP = "Rep"


class NegotiationMessageType(str, Enum):
    COMMENT = "Comment"
    CHANGE_REQUEST = "Change Request"
    COUNTER_DISCOUNT = "Counter Discount"


class NegotiationThread(Base):
    """A thread of negotiation messages for a specific quotation."""

    __tablename__ = "negotiation_threads"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"), index=True, unique=True)
    status: Mapped[NegotiationStatus] = mapped_column(
        SqlEnum(NegotiationStatus, name="negotiation_status_enum", values_callable=lambda statuses: [status.value for status in statuses]),
        default=NegotiationStatus.OPEN,
    )
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    quotation = relationship("Quotation")
    messages = relationship("NegotiationMessage", back_populates="thread", cascade="all, delete-orphan")


class NegotiationMessage(Base):
    """A single message within a negotiation thread."""

    __tablename__ = "negotiation_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    thread_id: Mapped[int] = mapped_column(ForeignKey("negotiation_threads.id"), index=True)
    quotation_line_id: Mapped[Optional[int]] = mapped_column(ForeignKey("quotation_lines.id"), nullable=True, index=True)
    
    author_type: Mapped[NegotiationAuthorType] = mapped_column(
        SqlEnum(NegotiationAuthorType, name="negotiation_author_type_enum", values_callable=lambda items: [i.value for i in items])
    )
    author_id: Mapped[int] = mapped_column(index=True)
    
    message_type: Mapped[NegotiationMessageType] = mapped_column(
        SqlEnum(NegotiationMessageType, name="negotiation_message_type_enum", values_callable=lambda items: [i.value for i in items])
    )
    content: Mapped[str] = mapped_column(Text)
    proposed_discount_percent: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    thread = relationship("NegotiationThread", back_populates="messages")
    quotation_line = relationship("QuotationLine")
