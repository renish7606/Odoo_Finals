from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional

from sqlalchemy import Date, DateTime, Enum as SqlEnum, ForeignKey, JSON, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class SubscriptionCadence(str, Enum):
    """Cadence intervals for recurring billing plans."""

    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class ScheduleStatus(str, Enum):
    """Execution status for an individual billing cycle."""

    SCHEDULED = "Scheduled"
    BILLED = "Billed"
    FAILED = "Failed"


class RefundType(str, Enum):
    """Policy for issuing refunds upon subscription cancellation."""

    FULL = "full"
    PARTIAL = "partial"
    NONE = "none"


class SubscriptionPlan(Base):
    """Defines a recurring pricing plan linked to a product."""

    __tablename__ = "subscription_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    cadence: Mapped[SubscriptionCadence] = mapped_column(
        SqlEnum(SubscriptionCadence, name="subscription_cadence_enum", values_callable=lambda c: [x.value for x in c])
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product")
    proration_rules = relationship("ProrationRule", back_populates="plan", cascade="all, delete-orphan")
    cancellation_rules = relationship("CancellationRule", back_populates="plan", cascade="all, delete-orphan")
    billing_schedules = relationship("BillingSchedule", back_populates="plan")


class BillingSchedule(Base):
    """A scheduled charge date and amount for a recurring quotation line."""

    __tablename__ = "billing_schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    quotation_line_id: Mapped[int] = mapped_column(ForeignKey("quotation_lines.id"), index=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"), index=True)
    billing_date: Mapped[date] = mapped_column(Date, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[ScheduleStatus] = mapped_column(
        SqlEnum(ScheduleStatus, name="schedule_status_enum", values_callable=lambda s: [x.value for x in s]),
        default=ScheduleStatus.SCHEDULED,
        index=True,
    )

    # Relationships
    quotation_line = relationship("QuotationLine", back_populates="billing_schedules")
    plan = relationship("SubscriptionPlan", back_populates="billing_schedules")


class ProrationRule(Base):
    """Config-driven proration formula for mid-cycle quantity and plan upgrades/downgrades."""

    __tablename__ = "proration_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"), index=True)
    rule_type: Mapped[str] = mapped_column(String(100), default="days_remaining_ratio")
    config_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    plan = relationship("SubscriptionPlan", back_populates="proration_rules")


class CancellationRule(Base):
    """Cancellation and refund policy attached to a subscription plan."""

    __tablename__ = "cancellation_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("subscription_plans.id"), index=True)
    refund_type: Mapped[RefundType] = mapped_column(
        SqlEnum(RefundType, name="refund_type_enum", values_callable=lambda r: [x.value for x in r]),
        default=RefundType.PARTIAL,
    )
    config_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relationships
    plan = relationship("SubscriptionPlan", back_populates="cancellation_rules")
