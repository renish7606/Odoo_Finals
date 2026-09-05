"""Expose current approval state for signed-in staff."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.approval import ApprovalRequest, ApprovalStep
router=APIRouter(prefix="/approvals",tags=["approvals"])
@router.get("/{quotation_id}")
def get_approval(quotation_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    """Return a quotation's approval request and steps."""
    request=db.scalar(select(ApprovalRequest).where(ApprovalRequest.quotation_id==quotation_id))
    if not request:raise HTTPException(404,"Approval request was not found")
    return {"request":request,"steps":db.scalars(select(ApprovalStep).where(ApprovalStep.approval_request_id==request.id)).all()}
