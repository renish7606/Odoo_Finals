"""Expose current approval state for signed-in staff."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.approval import ApprovalRequest, ApprovalStep
from app.models.quotation import Quotation
from app.services.approval_service import evaluate_and_route_approval

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("/{quotation_id}")
def get_approval(quotation_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    """Return a quotation's approval request and steps."""
    if db.get(Quotation, quotation_id) is None:
        raise HTTPException(status_code=404, detail="Quotation was not found")

    request = db.scalar(select(ApprovalRequest).where(ApprovalRequest.quotation_id == quotation_id))
    if request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No approval request exists for this quotation. Evaluate the quotation first.",
        )

    return {
        "request": request,
        "steps": db.scalars(
            select(ApprovalStep).where(ApprovalStep.approval_request_id == request.id)
        ).all(),
    }


@router.post("/{quotation_id}/evaluate")
def evaluate_quotation_approval(
    quotation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Evaluate a quotation and create or update its approval request."""
    try:
        result = evaluate_and_route_approval(quotation_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    db.commit()
    return result
