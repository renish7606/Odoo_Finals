from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional

from app.db.session import get_db
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.product import Product
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/kpis")
def get_report_kpis(
    period: str = Query("This Month", description="Time period filter"),
    status: str = Query("All Statuses", description="Approval status filter"),
    product: str = Query("All Products", description="Product filter"),
    db: Session = Depends(get_db)
):
    """Fetch dynamically filtered KPI data for the reporting dashboard."""
    now = datetime.now(timezone.utc)
    
    # 1. Parse Period
    start_date = None
    if period == "This Month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "Last Month":
        first_of_this = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_of_prev = first_of_this - timedelta(days=1)
        start_date = last_of_prev.replace(day=1)
        # End date would be first_of_this, but for simplicity we'll just filter >= start_date 
        # (assuming we want accurate last month we should bound it, let's just do start bound for now or bound properly)
        end_date = first_of_this
    elif period == "Q3":
        start_date = datetime(now.year, 7, 1, tzinfo=timezone.utc)
    elif period == "YTD":
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)

    # Base query for quotations
    q_stmt = select(func.count(Quotation.id))
    if start_date:
        q_stmt = q_stmt.where(Quotation.created_at >= start_date)
        if period == "Last Month":
            q_stmt = q_stmt.where(Quotation.created_at < end_date)

    # 1. Quotes Created
    quotes_count = db.scalar(q_stmt) or 0

    # 2. Avg Approval Time (filtered by status and period)
    req_stmt = select(ApprovalRequest)
    
    # Filter by Approval Status
    if status == "Approved":
        req_stmt = req_stmt.where(ApprovalRequest.status == ApprovalStatus.APPROVED)
    elif status == "Pending":
        req_stmt = req_stmt.where(
            or_(
                ApprovalRequest.status == ApprovalStatus.PENDING_MANAGER,
                ApprovalRequest.status == ApprovalStatus.PENDING_FINANCE
            )
        )
    elif status == "Rejected":
        req_stmt = req_stmt.where(ApprovalRequest.status == ApprovalStatus.REJECTED)
    else:
        # Default to only showing approved for the "Avg Time" metric, or show all completed if requested
        pass

    # Filter requests by period based on their created_at
    if start_date:
        req_stmt = req_stmt.where(ApprovalRequest.created_at >= start_date)
        if period == "Last Month":
            req_stmt = req_stmt.where(ApprovalRequest.created_at < end_date)

    requests = db.scalars(req_stmt).all()

    total_hours = 0
    valid_requests = 0
    for req in requests:
        # Get the latest step to calculate duration
        last_step = db.scalar(
            select(ApprovalStep)
            .where(ApprovalStep.approval_request_id == req.id)
            .where(ApprovalStep.decision.isnot(None))
            .order_by(desc(ApprovalStep.decided_at))
        )
        if last_step and last_step.decided_at and req.created_at:
            duration = last_step.decided_at - req.created_at
            total_hours += duration.total_seconds() / 3600.0
            valid_requests += 1

    avg_approval_time = round(total_hours / valid_requests, 1) if valid_requests > 0 else 0

    # 3. Top Upsold Product
    # Base product query
    prod_stmt = (
        select(Product.name, func.sum(QuotationLine.quantity).label("total_qty"))
        .join(QuotationLine, Product.id == QuotationLine.product_id)
        .join(Quotation, QuotationLine.quotation_id == Quotation.id)
        .where(Quotation.status.in_([QuotationStatus.APPROVED, QuotationStatus.CONFIRMED, QuotationStatus.FULFILLED]))
    )
    
    if start_date:
        prod_stmt = prod_stmt.where(Quotation.created_at >= start_date)
        if period == "Last Month":
            prod_stmt = prod_stmt.where(Quotation.created_at < end_date)

    if product != "All Products":
        prod_stmt = prod_stmt.where(Product.name.ilike(f"%{product}%"))

    top_product_row = db.execute(
        prod_stmt.group_by(Product.id)
        .order_by(desc("total_qty"))
        .limit(1)
    ).first()

    top_upsold_product = top_product_row.name if top_product_row else "None"

    return {
        "quotes_created": quotes_count,
        "avg_approval_time_hours": avg_approval_time,
        "top_upsold_product": top_upsold_product
    }


@router.get("/export/pdf")
def export_pdf(
    period: str = Query("This Month"),
    status: str = Query("All Statuses"),
    product: str = Query("All Products"),
    db: Session = Depends(get_db),
):
    """Generate and return a PDF report with current KPI data."""
    from fastapi.responses import StreamingResponse
    from fpdf import FPDF
    import io

    now = datetime.now(timezone.utc)

    # Reuse KPI logic
    start_date = None
    end_date = None
    if period == "This Month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "Last Month":
        first_of_this = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_of_prev = first_of_this - timedelta(days=1)
        start_date = last_of_prev.replace(day=1)
        end_date = first_of_this
    elif period == "Q3":
        start_date = datetime(now.year, 7, 1, tzinfo=timezone.utc)
    elif period == "YTD":
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)

    # Quotes Created
    q_stmt = select(func.count(Quotation.id))
    if start_date:
        q_stmt = q_stmt.where(Quotation.created_at >= start_date)
        if end_date:
            q_stmt = q_stmt.where(Quotation.created_at < end_date)
    quotes_count = db.scalar(q_stmt) or 0

    # Avg Approval Time
    req_stmt = select(ApprovalRequest)
    if status == "Approved":
        req_stmt = req_stmt.where(ApprovalRequest.status == ApprovalStatus.APPROVED)
    elif status == "Pending":
        req_stmt = req_stmt.where(or_(
            ApprovalRequest.status == ApprovalStatus.PENDING_MANAGER,
            ApprovalRequest.status == ApprovalStatus.PENDING_FINANCE,
        ))
    elif status == "Rejected":
        req_stmt = req_stmt.where(ApprovalRequest.status == ApprovalStatus.REJECTED)
    if start_date:
        req_stmt = req_stmt.where(ApprovalRequest.created_at >= start_date)
        if end_date:
            req_stmt = req_stmt.where(ApprovalRequest.created_at < end_date)
    requests = db.scalars(req_stmt).all()
    total_hours = 0
    valid_requests = 0
    for req in requests:
        last_step = db.scalar(
            select(ApprovalStep)
            .where(ApprovalStep.approval_request_id == req.id)
            .where(ApprovalStep.decision.isnot(None))
            .order_by(desc(ApprovalStep.decided_at))
        )
        if last_step and last_step.decided_at and req.created_at:
            duration = last_step.decided_at - req.created_at
            total_hours += duration.total_seconds() / 3600.0
            valid_requests += 1
    avg_time = round(total_hours / valid_requests, 1) if valid_requests > 0 else 0

    # Top Product
    prod_stmt = (
        select(Product.name, func.sum(QuotationLine.quantity).label("total_qty"))
        .join(QuotationLine, Product.id == QuotationLine.product_id)
        .join(Quotation, QuotationLine.quotation_id == Quotation.id)
        .where(Quotation.status.in_([QuotationStatus.APPROVED, QuotationStatus.CONFIRMED, QuotationStatus.FULFILLED]))
    )
    if start_date:
        prod_stmt = prod_stmt.where(Quotation.created_at >= start_date)
        if end_date:
            prod_stmt = prod_stmt.where(Quotation.created_at < end_date)
    if product != "All Products":
        prod_stmt = prod_stmt.where(Product.name.ilike(f"%{product}%"))
    top_row = db.execute(prod_stmt.group_by(Product.id).order_by(desc("total_qty")).limit(1)).first()
    top_product = top_row.name if top_row else "None"

    # --- Build the PDF ---
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Title
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 14, "DealFlow360 - Admin Report", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f"Generated: {now.strftime('%B %d, %Y at %H:%M UTC')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Filters applied
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Applied Filters", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Period: {period}    |    Approval Status: {status}    |    Product: {product}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # KPI Table
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 10, "Key Performance Indicators", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_fill_color(86, 98, 80)  # --color-primary #566250
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 11)
    col_w = 60
    pdf.cell(col_w, 10, "Metric", border=1, fill=True)
    pdf.cell(col_w * 2, 10, "Value", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 11)
    rows = [
        ("Quotes Created", f"{quotes_count} ({period.lower()})"),
        ("Avg Approval Time", f"{avg_time} hours"),
        ("Top Upsold Product", top_product),
    ]
    for label, value in rows:
        pdf.cell(col_w, 10, label, border=1)
        pdf.cell(col_w * 2, 10, value, border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 8, "This report was auto-generated by DealFlow360 Reporting Engine.", new_x="LMARGIN", new_y="NEXT")

    # Output to bytes
    buf = io.BytesIO()
    pdf.output(buf)
    buf.seek(0)

    filename = f"DealFlow360_Report_{now.strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
