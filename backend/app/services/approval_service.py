from __future__ import annotations

"""Create the idempotent approval route used by other groups."""
from dataclasses import dataclass
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep
from app.models.discount import ApprovalChainConfig, ApprovalLevel
from app.models.quotation import Quotation, QuotationStatus
from app.models.role import Role
from app.services.risk_score_service import blended_risk_score
@dataclass(frozen=True)
class ApprovalRoutingResult:
    """Describe whether approval was needed and its current request."""
    approval_required:bool; status:str; blended_risk_score:Decimal; approval_request_id:int|None
def evaluate_and_route_approval(quotation_id:int,db:Session)->ApprovalRoutingResult:
    """Recompute risk, then create or update one approval request safely."""
    quotation=db.get(Quotation,quotation_id)
    if quotation is None: raise ValueError("Quotation was not found")
    score=blended_risk_score(quotation_id,db)
    request=db.scalar(select(ApprovalRequest).where(ApprovalRequest.quotation_id==quotation_id))
    if score==0:
        if request is None: quotation.status=QuotationStatus.APPROVED
        return ApprovalRoutingResult(False,quotation.status.value,score,request.id if request else None)
    if request: request.blended_risk_score=score; return ApprovalRoutingResult(True,request.status.value,score,request.id)
    config=db.scalar(select(ApprovalChainConfig).where(ApprovalChainConfig.min_score<=score).order_by(ApprovalChainConfig.min_score.desc()))
    level=config.required_level if config else ApprovalLevel.MANAGER_ONLY
    request=ApprovalRequest(quotation_id=quotation_id,current_step=1,status=ApprovalStatus.PENDING_MANAGER,blended_risk_score=score); db.add(request); db.flush()
    db.add(ApprovalStep(approval_request_id=request.id,step_number=1,approver_role=Role.SALES_MANAGER))
    if level is ApprovalLevel.MANAGER_THEN_FINANCE: db.add(ApprovalStep(approval_request_id=request.id,step_number=2,approver_role=Role.FINANCE_OPS))
    return ApprovalRoutingResult(True,request.status.value,score,request.id)
