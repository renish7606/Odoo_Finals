"""Dashboard summary route."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.deal_health import StalledDealFlag, DiscountAnomalyFlag
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Return KPI summary for the dashboard including revenue, stage breakdown, and risk counts."""
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
    sent_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.SENT)
    ) or 0
    negotiation_count = db.scalar(
        select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.UNDER_NEGOTIATION)
    ) or 0

    # Win rate = (approved + confirmed + fulfilled) / total if total > 0
    won = approved_count + confirmed_count + fulfilled_count
    win_rate = round((won / total_quotations * 100), 1) if total_quotations > 0 else 0

    # Total pipeline revenue: sum of line totals for won deals (Approved + Confirmed + Fulfilled)
    won_statuses = [QuotationStatus.APPROVED, QuotationStatus.CONFIRMED, QuotationStatus.FULFILLED]
    total_revenue = db.scalar(
        select(func.coalesce(func.sum(QuotationLine.line_total), 0))
        .join(Quotation, QuotationLine.quotation_id == Quotation.id)
        .where(Quotation.status.in_(won_statuses))
    ) or 0

    # At-risk deal count: unique quotations with stalled or anomaly flags
    stalled_ids = set(
        row[0] for row in db.execute(select(StalledDealFlag.quotation_id)).all()
    )
    anomaly_ids = set(
        row[0] for row in db.execute(select(DiscountAnomalyFlag.quotation_id)).all()
    )
    at_risk_ids = stalled_ids | anomaly_ids
    at_risk_count = len(at_risk_ids)
    active_flags_count = len(stalled_ids) + len(anomaly_ids)

    # Stage breakdown for donut chart
    stage_breakdown = {
        "Draft": draft_count,
        "Pending Approval": pending_approvals,
        "Approved": approved_count,
        "Sent": sent_count,
        "Under Negotiation": negotiation_count,
        "Confirmed": confirmed_count,
        "Fulfilled": fulfilled_count,
        "Rejected": rejected_count,
    }

    return {
        "total_quotations": total_quotations,
        "total_revenue": float(total_revenue),
        "pending_approvals": pending_approvals,
        "draft_count": draft_count,
        "approved_count": approved_count,
        "confirmed_count": confirmed_count,
        "fulfilled_count": fulfilled_count,
        "rejected_count": rejected_count,
        "sent_count": sent_count,
        "negotiation_count": negotiation_count,
        "win_rate": win_rate,
        "at_risk_count": at_risk_count,
        "active_flags_count": active_flags_count,
        "stage_breakdown": stage_breakdown,
    }
