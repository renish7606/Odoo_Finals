from pydantic import BaseModel, condecimal
from typing import List, Optional
from decimal import Decimal
from app.models.customer import CustomerTier
from app.models.discount import ApprovalLevel

class DiscountTierBase(BaseModel):
    customer_tier: CustomerTier
    max_discount_percent: condecimal(max_digits=5, decimal_places=2)

class CategoryDiscountCeilingBase(BaseModel):
    category: str
    max_discount_percent: condecimal(max_digits=5, decimal_places=2)

class ApprovalChainConfigBase(BaseModel):
    min_score: condecimal(max_digits=8, decimal_places=4)
    max_score: Optional[condecimal(max_digits=8, decimal_places=4)] = None
    required_level: ApprovalLevel

class DiscountRulesPayload(BaseModel):
    tiers: List[DiscountTierBase]
    categories: List[CategoryDiscountCeilingBase]
    chains: List[ApprovalChainConfigBase]

class DiscountRulesResponse(BaseModel):
    tiers: List[DiscountTierBase]
    categories: List[CategoryDiscountCeilingBase]
    chains: List[ApprovalChainConfigBase]
