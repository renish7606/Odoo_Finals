from __future__ import annotations

"""Validate product and variant API data."""
from decimal import Decimal
from pydantic import BaseModel, Field
class ProductCreate(BaseModel):
    """Data needed to create a product."""
    name:str=Field(min_length=1,max_length=255); category:str=Field(min_length=1,max_length=100); base_price:Decimal=Field(ge=0); unit:str=Field(min_length=1,max_length=50); tax_rate:Decimal=Field(default=Decimal("0"),ge=0); description:str|None=None
class VariantCreate(BaseModel):
    """Data needed to create a variant."""
    attribute_name:str=Field(min_length=1); value:str=Field(min_length=1); extra_price:Decimal=Field(default=Decimal("0"),ge=0)
