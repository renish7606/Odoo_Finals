from __future__ import annotations

from typing import Optional
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class StalledDealFlag(Base):
    """Tracks quotations that have been inactive for too long."""

    __tablename__ = "stalled_deal_flags"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"), index=True, unique=True)
    flagged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    days_inactive: Mapped[int] = mapped_column()

    quotation = relationship("Quotation")


class DiscountAnomalyFlag(Base):
    """Tracks anomalous discounts given by reps compared to their historical average."""

    __tablename__ = "discount_anomaly_flags"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"), index=True)
    rep_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    discount_given: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    rep_average_discount: Mapped[Decimal] = mapped_column(Numeric(5, 2))
    flagged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    quotation = relationship("Quotation")
    rep = relationship("User")
