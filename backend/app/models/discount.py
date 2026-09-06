"""Store discount ceilings and routing bands."""
from decimal import Decimal
from enum import Enum
from typing import Optional
from sqlalchemy import Enum as SqlEnum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base
from app.models.customer import CustomerTier
class ApprovalLevel(str, Enum):
    """The supported approval paths."""
    MANAGER_ONLY = "MANAGER_ONLY"
    MANAGER_THEN_FINANCE = "MANAGER_THEN_FINANCE"
class DiscountTier(Base):
    """Tier-wide maximum discount."""
    __tablename__ = "discount_tiers"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_tier: Mapped[CustomerTier] = mapped_column(SqlEnum(CustomerTier, name="customer_tier_enum", create_type=False, values_callable=lambda x: [v.value for v in x]), unique=True)
    max_discount_percent: Mapped[Decimal] = mapped_column(Numeric(5,2))
class CategoryDiscountCeiling(Base):
    """Category-specific maximum discount."""
    __tablename__ = "category_discount_ceilings"
    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(100), unique=True)
    max_discount_percent: Mapped[Decimal] = mapped_column(Numeric(5,2))
class ApprovalChainConfig(Base):
    """Risk score band and required approval path."""
    __tablename__ = "approval_chain_configs"
    id: Mapped[int] = mapped_column(primary_key=True)
    min_score: Mapped[Decimal] = mapped_column(Numeric(8,4))
    max_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(8,4), nullable=True)
    required_level: Mapped[ApprovalLevel] = mapped_column(SqlEnum(ApprovalLevel, name="approval_level_enum"))
