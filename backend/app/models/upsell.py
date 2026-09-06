"""Upsell and cross-sell data models for Group B."""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class ProductPairingRule(Base):
    """Link two products as a co-purchase recommendation pair."""

    __tablename__ = "product_pairing_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    base_product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), index=True, nullable=False
    )
    suggested_product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), index=True, nullable=False
    )
    co_purchase_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    base_product = relationship("Product", foreign_keys=[base_product_id])
    suggested_product = relationship("Product", foreign_keys=[suggested_product_id])


class ProductPromotion(Base):
    """Flag a product as currently promoted for upsell boosting."""

    __tablename__ = "product_promotions"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), unique=True, nullable=False
    )
    is_promoted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    promo_label: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    starts_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ends_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    product = relationship("Product")


class UpsellConfig(Base):
    """Key/value store for upsell engine configuration (singleton-style)."""

    __tablename__ = "upsell_config"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
