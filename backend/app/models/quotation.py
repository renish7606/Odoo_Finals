"""Provide quotation headers and lines for future sales workflows."""

from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class QuotationStatus(str, Enum):
    """The shared quotation states used across later teams."""

    DRAFT = "Draft"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    SENT = "Sent"
    UNDER_NEGOTIATION = "Under Negotiation"
    CONFIRMED = "Confirmed"
    FULFILLED = "Fulfilled"
    REJECTED = "Rejected"


class Quotation(Base):
    """A sales document owned by one customer and sales representative."""

    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    rep_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[QuotationStatus] = mapped_column(
        SqlEnum(QuotationStatus, name="quotation_status_enum", values_callable=lambda statuses: [status.value for status in statuses]),
        default=QuotationStatus.DRAFT,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="quotations")
    rep = relationship("User", back_populates="quotations")
    lines = relationship("QuotationLine", back_populates="quotation", cascade="all, delete-orphan")


class QuotationLine(Base):
    """One product quantity on a quotation."""

    __tablename__ = "quotation_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    discount_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    category_snapshot: Mapped[str | None] = mapped_column(String(100), nullable=True)

    quotation = relationship("Quotation", back_populates="lines")
    product = relationship("Product", back_populates="quotation_lines")
