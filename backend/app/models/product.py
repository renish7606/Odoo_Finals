"""Keep the small product skeleton owned by the shared foundation."""

from decimal import Decimal

from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Product(Base):
    """A sellable item; pricing teams will add richer product rules later."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit: Mapped[str] = mapped_column(String(50))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    quotation_lines = relationship("QuotationLine", back_populates="product")
