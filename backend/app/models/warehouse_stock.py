"""Warehouse stock model owned by Group B."""

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class WarehouseStock(Base):
    """Track per-product inventory at each warehouse."""

    __tablename__ = "warehouse_stock"
    __table_args__ = (
        UniqueConstraint("warehouse_id", "product_id", name="uq_warehouse_product"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    warehouse_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("warehouses.id"), index=True, nullable=False
    )
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), index=True, nullable=False
    )
    quantity_on_hand: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reserved_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    replenishment_threshold: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    replenishment_lead_time_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    warehouse = relationship("Warehouse", back_populates="stock_entries")
    product = relationship("Product")
