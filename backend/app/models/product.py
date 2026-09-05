"""Store products and optional product variants."""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

class Product(Base):
    """A base product with a fallback price."""
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit: Mapped[str] = mapped_column(String(50))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    quotation_lines = relationship("QuotationLine", back_populates="product")

class Variant(Base):
    """A purchasable product option with an extra price."""
    __tablename__ = "variants"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    attribute_name: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(String(100))
    extra_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
