"""Pydantic schemas for subscription plans, proration, and cancellation endpoints."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.models.subscription import RefundType, ScheduleStatus, SubscriptionCadence


# ──────────────────────────────────────────────
# SubscriptionPlan
# ──────────────────────────────────────────────

class SubscriptionPlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    cadence: SubscriptionCadence
    product_id: int
    price: Decimal = Field(..., gt=0)


class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    cadence: Optional[SubscriptionCadence] = None
    price: Optional[Decimal] = Field(None, gt=0)


class SubscriptionPlanOut(BaseModel):
    id: int
    name: str
    cadence: SubscriptionCadence
    product_id: int
    price: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# ProrationRule
# ──────────────────────────────────────────────

class ProrationRuleCreate(BaseModel):
    plan_id: int
    rule_type: str = "days_remaining_ratio"
    config_json: Optional[Dict[str, Any]] = None


class ProrationRuleOut(BaseModel):
    id: int
    plan_id: int
    rule_type: str
    config_json: Optional[Dict[str, Any]]

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# CancellationRule
# ──────────────────────────────────────────────

class CancellationRuleCreate(BaseModel):
    plan_id: int
    refund_type: RefundType = RefundType.PARTIAL
    config_json: Optional[Dict[str, Any]] = None


class CancellationRuleOut(BaseModel):
    id: int
    plan_id: int
    refund_type: RefundType
    config_json: Optional[Dict[str, Any]]

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Proration Preview / Confirm
# ──────────────────────────────────────────────

class ProrationPreviewRequest(BaseModel):
    """Describe the intended change; no data is modified during preview."""
    new_plan_id: Optional[int] = None
    new_quantity: Optional[Decimal] = Field(None, gt=0)
    change_date: date = Field(default_factory=date.today)


class ProrationPreviewOut(BaseModel):
    """Proration calculation results before any data is committed."""
    proration_amount: Decimal
    direction: str            # "debit" | "credit"
    days_remaining: int
    total_days_in_cycle: int
    old_cycle_amount: Decimal
    new_cycle_amount: Decimal


class ProrationConfirmRequest(BaseModel):
    """Commit the proration change; data will be modified."""
    new_plan_id: Optional[int] = None
    new_quantity: Optional[Decimal] = Field(None, gt=0)
    change_date: date = Field(default_factory=date.today)


# ──────────────────────────────────────────────
# Cancel / Modify
# ──────────────────────────────────────────────

class CancelSubscriptionRequest(BaseModel):
    """Request to cancel a subscription line immediately."""
    cancellation_date: date = Field(default_factory=date.today)


class CancelSubscriptionOut(BaseModel):
    cancelled_schedules: int
    refund_amount: Decimal
    credit_note_id: Optional[int]


# ──────────────────────────────────────────────
# BillingSchedule output
# ──────────────────────────────────────────────

class BillingScheduleOut(BaseModel):
    id: int
    quotation_line_id: int
    plan_id: int
    billing_date: date
    amount: Decimal
    status: ScheduleStatus

    model_config = {"from_attributes": True}
