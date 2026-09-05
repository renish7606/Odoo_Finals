"""Pydantic schemas for warehouse, stock, fulfillment, and backorder endpoints."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------------
# Warehouse
# ---------------------------------------------------------------------------

class WarehouseCreate(BaseModel):
    """Create a new warehouse."""

    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    shipping_cost_weight: float = Field(1.0, ge=0.0)


class WarehouseUpdate(BaseModel):
    """Partially update a warehouse."""

    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(None, min_length=1, max_length=255)
    location: str | None = Field(None, min_length=1, max_length=255)
    shipping_cost_weight: float | None = Field(None, ge=0.0)


class WarehouseRead(BaseModel):
    """Return a warehouse to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    location: str
    shipping_cost_weight: float
    created_at: datetime


# ---------------------------------------------------------------------------
# Warehouse Stock
# ---------------------------------------------------------------------------

class StockCreate(BaseModel):
    """Set stock for a product at a warehouse."""

    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(..., gt=0)
    quantity_on_hand: int = Field(0, ge=0)
    reserved_quantity: int = Field(0, ge=0)
    replenishment_threshold: int | None = Field(None, ge=0)
    replenishment_lead_time_days: int | None = Field(None, ge=0)


class StockUpdate(BaseModel):
    """Partially update stock for a product at a warehouse."""

    model_config = ConfigDict(extra="forbid")

    quantity_on_hand: int | None = Field(None, ge=0)
    reserved_quantity: int | None = Field(None, ge=0)
    replenishment_threshold: int | None = Field(None, ge=0)
    replenishment_lead_time_days: int | None = Field(None, ge=0)


class StockRead(BaseModel):
    """Return stock info to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    warehouse_id: int
    product_id: int
    quantity_on_hand: int
    reserved_quantity: int
    replenishment_threshold: int | None
    replenishment_lead_time_days: int | None


class ReplenishRequest(BaseModel):
    """Increase stock at a warehouse — triggers backorder consolidation check."""

    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class ShippingWeightUpdate(BaseModel):
    """Update shipping cost weight for a warehouse."""

    model_config = ConfigDict(extra="forbid")

    shipping_cost_weight: float = Field(..., ge=0.0)


# ---------------------------------------------------------------------------
# Fulfillment Split
# ---------------------------------------------------------------------------

class SplitLineDetail(BaseModel):
    """One allocation line in a fulfillment split."""

    quotation_line_id: int
    product_id: int
    warehouse_id: int
    warehouse_name: str
    quantity_fulfilled: int
    quantity_backordered: int


class SuggestedSplitResponse(BaseModel):
    """The full suggested split plan for a quotation."""

    quotation_id: int
    status: str
    shipment_count: int
    estimated_cost: float
    lines: list[SplitLineDetail]
    has_backorders: bool


class AcceptSplitRequest(BaseModel):
    """Accept a suggested fulfillment split."""

    model_config = ConfigDict(extra="forbid")

    quotation_id: int = Field(..., gt=0)


class OverrideLineInput(BaseModel):
    """One line of a manual override allocation."""

    model_config = ConfigDict(extra="forbid")

    quotation_line_id: int = Field(..., gt=0)
    warehouse_id: int = Field(..., gt=0)
    quantity: int = Field(..., ge=0)


class OverrideSplitRequest(BaseModel):
    """Manually override a fulfillment split allocation."""

    model_config = ConfigDict(extra="forbid")

    quotation_id: int = Field(..., gt=0)
    lines: list[OverrideLineInput] = Field(..., min_length=1)
    reason: str | None = None


class FulfillmentSplitRead(BaseModel):
    """Return a fulfillment split to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    quotation_id: int
    status: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Backorder
# ---------------------------------------------------------------------------

class BackorderRead(BaseModel):
    """Return a backorder record to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    fulfillment_split_line_id: int
    quantity_remaining: int
    status: str
    resolved_at: datetime | None
