"""Store dated customer-tier price overrides."""
from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import Date, Enum as SqlEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base
from app.models.customer import CustomerTier

_tier = lambda: SqlEnum(CustomerTier, name="customer_tier_enum", create_type=False, values_callable=lambda x: [v.value for v in x])
class PriceList(Base):
    """A dated list for one tier and currency."""
    __tablename__ = "price_lists"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    customer_tier: Mapped[CustomerTier] = mapped_column(_tier())
    currency: Mapped[str] = mapped_column(String(3))
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
class PriceListEntry(Base):
    """One product or variant price override."""
    __tablename__ = "price_list_entries"
    id: Mapped[int] = mapped_column(primary_key=True)
    price_list_id: Mapped[int] = mapped_column(ForeignKey("price_lists.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    variant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("variants.id"), nullable=True)
    resolved_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
