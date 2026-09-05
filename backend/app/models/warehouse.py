"""Warehouse model owned by Group B."""

from datetime import datetime

from sqlalchemy import DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Warehouse(Base):
    """A physical warehouse location with a shipping cost weight."""

    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    shipping_cost_weight: Mapped[float] = mapped_column(
        Float, nullable=False, default=1.0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    stock_entries = relationship("WarehouseStock", back_populates="warehouse")
