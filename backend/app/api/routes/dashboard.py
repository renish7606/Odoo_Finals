"""Dashboard summary route."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.quotation import Quotation, QuotationStatus
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Return KPI summary for the dashboard."""
    total_quotations = db.scalar(select(func.count(Quotation.id))) or 0
    pending_approvals = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.PENDING_APPROVAL)
    ) or 0
    draft_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.DRAFT)
    ) or 0
    approved_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.APPROVED)
    ) or 0
    confirmed_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.CONFIRMED)
    ) or 0
    fulfilled_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.FULFILLED)
    ) or 0
    rejected_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.REJECTED)
    ) or 0

    # Win rate = (approved + confirmed + fulfilled) / total if total > 0
    won = approved_count + confirmed_count + fulfilled_count
    win_rate = round((won / total_quotations * 100), 1) if total_quotations > 0 else 0

    return {
        "total_quotations": total_quotations,
        "pending_approvals": pending_approvals,
        "draft_count": draft_count,
        "approved_count": approved_count,
        "confirmed_count": confirmed_count,
        "fulfilled_count": fulfilled_count,
        "rejected_count": rejected_count,
        "win_rate": win_rate,
    }
