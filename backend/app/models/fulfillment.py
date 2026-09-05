"""Fulfillment split, split lines, and backorder models owned by Group B."""

from datetime import datetime
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class FulfillmentStatus(str, Enum):
    """Lifecycle states for a fulfillment split."""

    SUGGESTED = "suggested"
    ACCEPTED = "accepted"
    MANUALLY_OVERRIDDEN = "manually_overridden"
    PARTIALLY_FULFILLED = "partially_fulfilled"
    FULFILLED = "fulfilled"


class BackorderStatus(str, Enum):
    """Lifecycle states for a backorder record."""

    OPEN = "open"
    CONSOLIDATION_READY = "consolidation_ready"
    CONSOLIDATED = "consolidated"
    CLOSED = "closed"


class FulfillmentSplit(Base):
    """Top-level fulfillment plan for one quotation/order."""

    __tablename__ = "fulfillment_splits"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quotations.id"), index=True, nullable=False
    )
    status: Mapped[FulfillmentStatus] = mapped_column(
        SqlEnum(
            FulfillmentStatus,
            name="fulfillment_status_enum",
            values_callable=lambda s: [v.value for v in s],
        ),
        default=FulfillmentStatus.SUGGESTED,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    quotation = relationship("Quotation")
    lines = relationship(
        "FulfillmentSplitLine",
        back_populates="fulfillment_split",
        cascade="all, delete-orphan",
    )


class FulfillmentSplitLine(Base):
    """One product allocation to a specific warehouse within a split."""

    __tablename__ = "fulfillment_split_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    fulfillment_split_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("fulfillment_splits.id"), index=True, nullable=False
    )
    quotation_line_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quotation_lines.id"), index=True, nullable=False
    )
    warehouse_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("warehouses.id"), index=True, nullable=True
    )
    quantity_fulfilled: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    quantity_backordered: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )

    fulfillment_split = relationship("FulfillmentSplit", back_populates="lines")
    quotation_line = relationship("QuotationLine")
    warehouse = relationship("Warehouse")
    backorders = relationship(
        "Backorder",
        back_populates="fulfillment_split_line",
        cascade="all, delete-orphan",
    )


class Backorder(Base):
    """Track unfulfilled product quantities waiting for replenishment."""

    __tablename__ = "backorders"

    id: Mapped[int] = mapped_column(primary_key=True)
    fulfillment_split_line_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("fulfillment_split_lines.id"),
        index=True,
        nullable=False,
    )
    quantity_remaining: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[BackorderStatus] = mapped_column(
        SqlEnum(
            BackorderStatus,
            name="backorder_status_enum",
            values_callable=lambda s: [v.value for v in s],
        ),
        default=BackorderStatus.OPEN,
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    fulfillment_split_line = relationship(
        "FulfillmentSplitLine", back_populates="backorders"
    )
