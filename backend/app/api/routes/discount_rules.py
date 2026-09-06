"""Discount rule routes."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalChainConfig
from app.schemas.discount import DiscountRulesPayload, DiscountRulesResponse

router = APIRouter(prefix="/discount-rules", tags=["discount rules"])

@router.get("", response_model=DiscountRulesResponse)
def get_discount_rules(db: Session = Depends(get_db), user=Depends(get_current_user)):
    tiers = db.scalars(select(DiscountTier)).all()
    categories = db.scalars(select(CategoryDiscountCeiling)).all()
    chains = db.scalars(select(ApprovalChainConfig)).all()
    return {
        "tiers": tiers,
        "categories": categories,
        "chains": chains
    }

@router.put("", response_model=DiscountRulesResponse)
def update_discount_rules(data: DiscountRulesPayload, db: Session = Depends(get_db), user=Depends(require_role("Admin"))):
    db.query(DiscountTier).delete()
    db.query(CategoryDiscountCeiling).delete()
    db.query(ApprovalChainConfig).delete()
    
    for t in data.tiers:
        db.add(DiscountTier(**t.dict()))
    for c in data.categories:
        db.add(CategoryDiscountCeiling(**c.dict()))
    for ch in data.chains:
        db.add(ApprovalChainConfig(**ch.dict()))
        
    db.commit()
    return get_discount_rules(db=db, user=user)
