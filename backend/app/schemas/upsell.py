"""Pydantic schemas for upsell / cross-sell endpoints."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------------
# Pairing Rules
# ---------------------------------------------------------------------------

class PairingRuleCreate(BaseModel):
    """Create a new product pairing rule."""

    model_config = ConfigDict(extra="forbid")

    base_product_id: int = Field(..., gt=0)
    suggested_product_id: int = Field(..., gt=0)
    co_purchase_score: float = Field(0.0, ge=0.0)


class PairingRuleUpdate(BaseModel):
    """Partially update a pairing rule."""

    model_config = ConfigDict(extra="forbid")

    co_purchase_score: float | None = Field(None, ge=0.0)


class PairingRuleRead(BaseModel):
    """Return a pairing rule to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    base_product_id: int
    suggested_product_id: int
    co_purchase_score: float
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Promotions
# ---------------------------------------------------------------------------

class PromotionCreate(BaseModel):
    """Flag a product as promoted."""

    model_config = ConfigDict(extra="forbid")

    product_id: int = Field(..., gt=0)
    is_promoted: bool = True
    promo_label: str | None = Field(None, max_length=255)
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class PromotionUpdate(BaseModel):
    """Partially update a promotion."""

    model_config = ConfigDict(extra="forbid")

    is_promoted: bool | None = None
    promo_label: str | None = Field(None, max_length=255)
    starts_at: datetime | None = None
    ends_at: datetime | None = None


class PromotionRead(BaseModel):
    """Return a promotion record to the client."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    is_promoted: bool
    promo_label: str | None
    starts_at: datetime | None
    ends_at: datetime | None


# ---------------------------------------------------------------------------
# Upsell Config
# ---------------------------------------------------------------------------

class UpsellConfigRead(BaseModel):
    """Return the upsell engine configuration."""

    minimum_margin_threshold: float


class UpsellConfigUpdate(BaseModel):
    """Update the minimum margin threshold."""

    model_config = ConfigDict(extra="forbid")

    minimum_margin_threshold: float = Field(..., ge=0.0)


# ---------------------------------------------------------------------------
# Suggestions
# ---------------------------------------------------------------------------

class UpsellSuggestion(BaseModel):
    """One ranked upsell suggestion for the frontend panel."""

    product_id: int
    product_name: str
    base_price: Decimal
    margin_delta: Decimal
    is_promoted: bool
    promo_label: str | None
    score: float
    rank: int


class AddSuggestionRequest(BaseModel):
    """Add a suggested product to a quotation."""

    model_config = ConfigDict(extra="forbid")

    quotation_id: int = Field(..., gt=0)
    product_id: int = Field(..., gt=0)
    quantity: int = Field(1, ge=1)


class QuotationTotalsResponse(BaseModel):
    """Simplified quotation totals after an upsell line is added."""

    quotation_id: int
    total_lines: int
    subtotal: Decimal
    message: str
