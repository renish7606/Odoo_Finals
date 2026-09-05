from typing import Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from sqlalchemy.orm import Session

from app.api import deps
from app.models.quotation import Quotation, QuotationStatus
from app.models.user import User
from app.services import export_service

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_filtered_quotations(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    rep_id: Optional[int] = None,
    status: Optional[str] = None
) -> list:
    query = db.query(Quotation)
    
    if start_date:
        query = query.filter(Quotation.created_at >= start_date)
    if end_date:
        query = query.filter(Quotation.created_at <= end_date)
    if rep_id:
        query = query.filter(Quotation.rep_id == rep_id)
    if status:
        query = query.filter(Quotation.status == QuotationStatus(status))
        
    return query.all()


def _format_quotations_data(quotations) -> list:
    return [{
        "id": q.id,
        "customer_id": q.customer_id,
        "rep_id": q.rep_id,
        "status": q.status.value,
        "created_at": q.created_at.isoformat(),
        "updated_at": q.updated_at.isoformat()
    } for q in quotations]


@router.get("/quotations")
def get_quotations_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    rep_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    quotations = _get_filtered_quotations(db, start_date, end_date, rep_id, status)
    return _format_quotations_data(quotations)


@router.get("/quotations/export/{format}")
def export_quotations_report(
    format: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    rep_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if format not in ["pdf", "xls"]:
        raise HTTPException(status_code=400, detail="Invalid format. Use pdf or xls.")
        
    quotations = _get_filtered_quotations(db, start_date, end_date, rep_id, status)
    data = _format_quotations_data(quotations)
    
    if format == "xls":
        content = export_service.export_to_xls(data)
        media_type = "text/csv"
        filename = "report.csv"
    else:
        content = export_service.export_to_pdf(data)
        media_type = "text/plain"
        filename = "report.pdf"
        
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
