"""Validate approval decision API data."""
from typing import Optional
from pydantic import BaseModel, Field

class ApprovalDecision(BaseModel):
    """A manager or finance decision."""
    decision: str = Field(pattern="^(APPROVE|REJECT|RETURN)$")
    reason: Optional[str] = None

