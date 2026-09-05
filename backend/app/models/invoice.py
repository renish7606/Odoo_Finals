from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class InvoiceStatus(str, Enum):
    """Lifecycle statuses for billing invoices."""

    UNPAID = "Unpaid"
    PAID = "Paid"
    PARTIALLY_PAID = "PartiallyPaid"


class Invoice(Base):
    """An invoice generated for one-time orders, recurring billing cycles, or proration debits."""

    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[InvoiceStatus] = mapped_column(
        SqlEnum(InvoiceStatus, name="invoice_status_enum", values_callable=lambda s: [x.value for x in s]),
        default=InvoiceStatus.UNPAID,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    quotation = relationship("Quotation", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")
    credit_notes = relationship("CreditNote", back_populates="invoice", cascade="all, delete-orphan")


class Payment(Base):
    """A financial payment credited toward a specific invoice."""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")


class CreditNote(Base):
    """A credit adjustment or refund note issued against an invoice."""

    __tablename__ = "credit_notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="credit_notes")
