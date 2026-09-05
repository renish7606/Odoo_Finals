from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal

from app.api import deps
from app.models.customer import Customer
from app.models.portal import PortalAccess
from app.models.quotation import Quotation, QuotationStatus
from app.models.negotiation import NegotiationThread, NegotiationMessage, NegotiationStatus, NegotiationAuthorType, NegotiationMessageType
from app.models.audit_log import AuditLog
from app.schemas.negotiation import QuotationPortalResponse, NegotiationMessageCreate, NegotiationMessageResponse
from app.services.approval_routing import route_quotation

router = APIRouter(prefix="/portal", tags=["portal"])

APPROVAL_THRESHOLD_PERCENT = Decimal("15.0")  # Arbitrary default for Phase 9


def _get_portal_access(db: Session, quotation_id: int, customer: Customer) -> PortalAccess:
    access = db.query(PortalAccess).filter(
        PortalAccess.quotation_id == quotation_id,
        PortalAccess.customer_id == customer.id,
        PortalAccess.revoked_at.is_(None)
    ).first()
    if not access:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No portal access for this quotation")
    return access


@router.get("/quotations/{quotation_id}", response_model=QuotationPortalResponse)
def get_portal_quotation(
    quotation_id: int,
    db: Session = Depends(deps.get_db),
    current_customer: Customer = Depends(deps.require_portal_scope)
) -> Any:
    """GET quotation details + full NegotiationThread/message history for the authenticated customer"""
    _get_portal_access(db, quotation_id, current_customer)

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

    thread = db.query(NegotiationThread).filter(NegotiationThread.quotation_id == quotation_id).first()

    return {
        "quotation_id": quotation.id,
        "customer_id": quotation.customer_id,
        "rep_id": quotation.rep_id,
        "status": quotation.status.value,
        "thread": thread
    }


@router.post("/quotations/{quotation_id}/messages", response_model=NegotiationMessageResponse)
def post_negotiation_message(
    quotation_id: int,
    message_in: NegotiationMessageCreate,
    db: Session = Depends(deps.get_db),
    current_customer: Customer = Depends(deps.require_portal_scope)
) -> Any:
    """POST a line-level comment/change request or counter-discount proposal"""
    _get_portal_access(db, quotation_id, current_customer)

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

    thread = db.query(NegotiationThread).filter(NegotiationThread.quotation_id == quotation_id).first()
    if not thread:
        thread = NegotiationThread(quotation_id=quotation_id, status=NegotiationStatus.OPEN)
        db.add(thread)
        db.commit()
        db.refresh(thread)
        
    if thread.status == NegotiationStatus.RESOLVED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Negotiation thread is closed")

    msg = NegotiationMessage(
        thread_id=thread.id,
        quotation_line_id=message_in.quotation_line_id,
        author_type=NegotiationAuthorType.CUSTOMER,
        author_id=current_customer.id,
        message_type=message_in.message_type,
        content=message_in.content,
        proposed_discount_percent=message_in.proposed_discount_percent
    )
    db.add(msg)

    if quotation.status != QuotationStatus.UNDER_NEGOTIATION:
        quotation.status = QuotationStatus.UNDER_NEGOTIATION
        db.add(quotation)

    audit = AuditLog(
        entity_type="Quotation",
        entity_id=quotation_id,
        user_id=None,  # Portal action by customer
        action=f"negotiation_{message_in.message_type.value.lower().replace(' ', '_')}",
        reason=f"Customer portal: {message_in.message_type.value}"
    )
    db.add(audit)

    db.commit()
    db.refresh(msg)
    return msg


@router.post("/quotations/{quotation_id}/confirm")
def confirm_quotation(
    quotation_id: int,
    db: Session = Depends(deps.get_db),
    current_customer: Customer = Depends(deps.require_portal_scope)
) -> Any:
    """POST confirm quotation → closes the NegotiationThread"""
    _get_portal_access(db, quotation_id, current_customer)

    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

    thread = db.query(NegotiationThread).filter(NegotiationThread.quotation_id == quotation_id).first()
    if thread:
        thread.status = NegotiationStatus.RESOLVED
        thread.closed_at = datetime.utcnow()
        db.add(thread)

    # Check max discount among lines or proposed counter discounts.
    # For Phase 9, if ANY line has a discount > threshold, we trigger routing.
    exceeds_threshold = False
    for line in quotation.lines:
        if line.discount_percent and line.discount_percent > APPROVAL_THRESHOLD_PERCENT:
            exceeds_threshold = True
            break
            
    # Also check if any recent counter-discount exceeds it
    if not exceeds_threshold and thread:
        for msg in thread.messages:
            if msg.proposed_discount_percent and msg.proposed_discount_percent > APPROVAL_THRESHOLD_PERCENT:
                exceeds_threshold = True
                break

    if exceeds_threshold:
        quotation.status = QuotationStatus.PENDING_APPROVAL
        db.add(quotation)
        route_quotation(quotation.id)
        action_msg = "Confirmed via portal, routed for approval"
    else:
        quotation.status = QuotationStatus.CONFIRMED
        db.add(quotation)
        action_msg = "Confirmed via portal, ready for fulfillment"

    audit = AuditLog(
        entity_type="Quotation",
        entity_id=quotation_id,
        user_id=None,
        action="portal_confirm",
        reason=action_msg
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "quotation_status": quotation.status.value, "routed_for_approval": exceeds_threshold}
