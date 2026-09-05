"""Store the customer record used by quotations and portal access."""

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SqlEnum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class CustomerTier(str, Enum):
    """Simple customer group for future teams to extend."""

    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"


class Customer(Base):
    """A buyer that can receive quotations and portal links."""

    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    tier: Mapped[CustomerTier] = mapped_column(
        SqlEnum(CustomerTier, name="customer_tier_enum", values_callable=lambda tiers: [tier.value for tier in tiers])
    )
    portal_password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    quotations = relationship("Quotation", back_populates="customer")
