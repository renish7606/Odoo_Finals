from typing import Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.models.deal_health import StalledDealFlag, DiscountAnomalyFlag
from app.models.audit_log import AuditLog
from app.models.user import User
from app.services import deal_health_service

router = APIRouter(prefix="/deal_health", tags=["deal_health"])

class ResolvePayload(BaseModel):
    issue_type: Optional[str] = None


@router.get("/stalled")
def get_stalled_deals(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Detect and return stalled deals."""
    deal_health_service.detect_stalled_deals(db)
    
    stalled = db.query(StalledDealFlag).all()
    return [{"id": s.id, "quotation_id": s.quotation_id, "days_inactive": s.days_inactive, "flagged_at": s.flagged_at} for s in stalled]


@router.get("/anomalies")
def get_discount_anomalies(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Detect and return discount anomalies."""
    deal_health_service.detect_discount_anomalies(db)
    
    anomalies = db.query(DiscountAnomalyFlag).all()
    return [{
        "id": a.id,
        "quotation_id": a.quotation_id,
        "rep_id": a.rep_id,
        "discount_given": a.discount_given,
        "rep_average_discount": a.rep_average_discount,
        "flagged_at": a.flagged_at
    } for a in anomalies]


@router.get("/slippage")
def get_delivery_slippage(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Return delivery slippage for confirmed/approved quotes."""
    return deal_health_service.get_all_delivery_slippages(db)


@router.post("/{quotation_id}/nudge")
def nudge_deal(quotation_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Log a nudge for a specific quotation."""
    audit = AuditLog(
        entity_type="Quotation",
        entity_id=quotation_id,
        user_id=current_user.id,
        action="nudge",
        reason="Nudged to resolve anomaly or stall"
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": f"Nudge sent for quotation {quotation_id}"}


@router.post("/{quotation_id}/escalate")
def escalate_deal(quotation_id: int, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Log an escalation for a specific quotation."""
    audit = AuditLog(
        entity_type="Quotation",
        entity_id=quotation_id,
        user_id=current_user.id,
        action="escalate",
        reason="Escalated to Manager for Deal Health risk resolution"
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": f"Deal {quotation_id} escalated to Manager"}


@router.post("/{quotation_id}/resolve")
def resolve_deal(quotation_id: int, payload: ResolvePayload, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)) -> Any:
    """Log risk resolution for a specific quotation and clear flags."""
    audit = AuditLog(
        entity_type="Quotation",
        entity_id=quotation_id,
        user_id=current_user.id,
        action="resolve",
        reason=f"Deal Health risk resolved: {payload.issue_type}" if payload.issue_type else "Deal Health risk resolved"
    )
    db.add(audit)
    
    # Remove from flags so it no longer appears in at-risk queries
    if not payload.issue_type or payload.issue_type == "stalled":
        stalled = db.query(StalledDealFlag).filter(StalledDealFlag.quotation_id == quotation_id).first()
        if stalled:
            db.delete(stalled)
            
    if not payload.issue_type or payload.issue_type == "discount_anomaly":
        anomaly = db.query(DiscountAnomalyFlag).filter(DiscountAnomalyFlag.quotation_id == quotation_id).first()
        if anomaly:
            db.delete(anomaly)
            
    db.commit()
    
    return {"status": "success", "message": f"Deal {quotation_id} risks resolved"}
