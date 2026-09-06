from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.quotation import Quotation, QuotationStatus, QuotationLine
from app.models.deal_health import StalledDealFlag, DiscountAnomalyFlag
from app.services.fulfillment_engine import get_delivery_slippage_days

STALLED_DAYS_THRESHOLD = 5
MIN_QUOTES_FOR_ANOMALY = 5
ANOMALY_DISCOUNT_THRESHOLD_MULTIPLIER = Decimal("1.5") # e.g. 1.5x their historical average


def detect_stalled_deals(db: Session) -> int:
    """Find and flag deals inactive for > N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=STALLED_DAYS_THRESHOLD)
    
    # Active negotiation or draft statuses
    active_statuses = [
        QuotationStatus.DRAFT,
        QuotationStatus.SENT,
        QuotationStatus.UNDER_NEGOTIATION,
        QuotationStatus.PENDING_APPROVAL
    ]

    stalled_quotations = db.query(Quotation).filter(
        Quotation.status.in_(active_statuses),
        Quotation.updated_at < cutoff
    ).all()

    flagged_count = 0
    for q in stalled_quotations:
        days_inactive = (datetime.now(timezone.utc) - q.updated_at).days
        
        # Check if already flagged
        existing = db.query(StalledDealFlag).filter(StalledDealFlag.quotation_id == q.id).first()
        if existing:
            existing.days_inactive = days_inactive
            db.add(existing)
        else:
            flag = StalledDealFlag(quotation_id=q.id, days_inactive=days_inactive)
            db.add(flag)
            flagged_count += 1
            
    db.commit()
    return flagged_count


def detect_discount_anomalies(db: Session) -> int:
    """Identify when a rep offers a discount way above their historical mean."""
    # Group by rep_id, count quotes, get avg discount across all their lines
    # This is a simplified approach:
    
    # For each rep, get historical average discount
    reps_stats = db.query(
        Quotation.rep_id,
        func.count(func.distinct(Quotation.id)).label("quote_count"),
        func.avg(QuotationLine.discount_percent).label("avg_discount")
    ).join(QuotationLine).filter(QuotationLine.discount_percent != None).group_by(Quotation.rep_id).all()

    rep_averages = {}
    for stat in reps_stats:
        if stat.quote_count >= MIN_QUOTES_FOR_ANOMALY and stat.avg_discount:
            rep_averages[stat.rep_id] = Decimal(stat.avg_discount)

    flagged_count = 0
    # Check current pending/under negotiation deals for those reps
    active_quotes = db.query(Quotation).filter(
        Quotation.status.in_([QuotationStatus.DRAFT, QuotationStatus.UNDER_NEGOTIATION])
    ).all()

    for q in active_quotes:
        if q.rep_id not in rep_averages:
            continue
            
        rep_avg = rep_averages[q.rep_id]
        
        max_discount_in_quote = Decimal(0)
        for line in q.lines:
            if line.discount_percent and line.discount_percent > max_discount_in_quote:
                max_discount_in_quote = line.discount_percent
                
        # If the max discount in this quote is e.g. 50% more than their historical average
        if max_discount_in_quote > (rep_avg * ANOMALY_DISCOUNT_THRESHOLD_MULTIPLIER):
            # Check if flagged already
            existing = db.query(DiscountAnomalyFlag).filter(
                DiscountAnomalyFlag.quotation_id == q.id
            ).first()
            if not existing:
                flag = DiscountAnomalyFlag(
                    quotation_id=q.id,
                    rep_id=q.rep_id,
                    discount_given=max_discount_in_quote,
                    rep_average_discount=rep_avg
                )
                db.add(flag)
                flagged_count += 1

    db.commit()
    return flagged_count


def get_all_delivery_slippages(db: Session) -> list:
    """Returns a list of Confirmed/Approved quotations and their slippage days."""
    quotations = db.query(Quotation).filter(
        Quotation.status.in_([QuotationStatus.CONFIRMED, QuotationStatus.APPROVED])
    ).all()
    
    results = []
    for q in quotations:
        slippage = get_delivery_slippage_days(q.id)
        if slippage > 0:
            results.append({
                "quotation_id": q.id,
                "slippage_days": slippage
            })
    return results
