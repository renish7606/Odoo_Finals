from __future__ import annotations

"""Validate price-list API data."""
from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.customer import CustomerTier
class PriceListCreate(BaseModel):
    """Data needed to create a dated price list."""
    name:str=Field(min_length=1); customer_tier:CustomerTier; currency:str=Field(min_length=3,max_length=3); effective_from:date; effective_to:date|None=None
class PriceEntryCreate(BaseModel):
    """Data needed to add one price override."""
    product_id:int=Field(gt=0); variant_id:int|None=None; resolved_price:Decimal=Field(ge=0)
