"""Fulfillment split, accept, override, and backorder endpoints — Group B.

Auto-discovered by ``app.api.v1.api.build_api_router``.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.fulfillment import (
    Backorder,
    BackorderStatus,
    FulfillmentSplit,
    FulfillmentSplitLine,
    FulfillmentStatus,
)
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock
from app.schemas.fulfillment import (
    AcceptSplitRequest,
    BackorderRead,
    FulfillmentSplitRead,
    ManualOverrideRequest,
    OverrideSplitRequest,
    SplitLineDetail,
    SuggestedSplitResponse,
)
from app.services.fulfillment_service import (
    OrderLine,
    SplitResult,
    StockEntry,
    compute_suggested_split,
)

router = APIRouter(prefix="/fulfillment", tags=["fulfillment"])

_WRITE_ROLES = (Role.FINANCE_OPS.value, Role.ADMIN.value)
_ALL_INTERNAL = (
    Role.SALES_REP.value,
    Role.SALES_MANAGER.value,
    Role.FINANCE_OPS.value,
    Role.ADMIN.value,
)


def _build_split_data(db: Session, quotation_id: int) -> tuple[list[OrderLine], list[StockEntry]]:
    """Load order lines and warehouse stock into plain data for the algorithm."""
    q_lines = db.scalars(
        select(QuotationLine).where(QuotationLine.quotation_id == quotation_id)
    ).all()
    if not q_lines:
        raise HTTPException(status_code=400, detail="Quotation has no lines")

    order_lines = [
        OrderLine(
            quotation_line_id=ql.id,
            product_id=ql.product_id,
            quantity_required=int(ql.quantity),
        )
        for ql in q_lines
    ]

    # Load all warehouse stock
    all_stock = db.scalars(select(WarehouseStock)).all()
    warehouses = {w.id: w for w in db.scalars(select(Warehouse)).all()}

    stock_entries = []
    for s in all_stock:
        wh = warehouses.get(s.warehouse_id)
        if wh is None:
            continue
        stock_entries.append(
            StockEntry(
                warehouse_id=s.warehouse_id,
                warehouse_name=wh.name,
                product_id=s.product_id,
                quantity_available=s.quantity_on_hand - s.reserved_quantity,
                shipping_cost_weight=wh.shipping_cost_weight,
            )
        )

    return order_lines, stock_entries


def _split_to_response(quotation_id: int, result: SplitResult) -> SuggestedSplitResponse:
    """Map a SplitResult to the API response schema."""
    lines = [
        SplitLineDetail(
            quotation_line_id=a.quotation_line_id,
            product_id=a.product_id,
            warehouse_id=a.warehouse_id,
            warehouse_name=a.warehouse_name,
            quantity_fulfilled=a.quantity_fulfilled,
            quantity_backordered=a.quantity_backordered,
        )
        for a in result.allocations
    ]
    st = "partially_fulfilled" if result.has_backorders else "suggested"
    return SuggestedSplitResponse(
        quotation_id=quotation_id,
        status=st,
        shipment_count=result.shipment_count,
        estimated_cost=result.estimated_cost,
        lines=lines,
        has_backorders=result.has_backorders,
    )


# ── Suggested Split ───────────────────────────────────────────────────────

@router.get("/suggested-split", response_model=SuggestedSplitResponse)
def suggested_split(
    quotation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> SuggestedSplitResponse:
    """Compute a suggested fulfillment split for a quotation."""
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")

    order_lines, stock_entries = _build_split_data(db, quotation_id)

    if not stock_entries:
        # Zero warehouses — return error per spec
        raise HTTPException(status_code=400, detail="No warehouses are configured")

    result = compute_suggested_split(order_lines, stock_entries)
    return _split_to_response(quotation_id, result)


# ── Accept Split ───────────────────────────────────────────────────────────

@router.post("/accept", response_model=FulfillmentSplitRead)
def accept_split(
    payload: AcceptSplitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> FulfillmentSplitRead:
    """Accept a suggested fulfillment split: persist and lock stock rows.

    Uses SELECT ... FOR UPDATE inside a single transaction to prevent
    concurrent overselling.
    """
    quotation = db.get(Quotation, payload.quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")

    order_lines, stock_entries = _build_split_data(db, payload.quotation_id)
    result = compute_suggested_split(order_lines, stock_entries)

    # Determine the status
    split_status = (
        FulfillmentStatus.PARTIALLY_FULFILLED if result.has_backorders
        else FulfillmentStatus.ACCEPTED
    )

    split = FulfillmentSplit(
        quotation_id=payload.quotation_id,
        status=split_status,
    )
    db.add(split)
    db.flush()  # get split.id

    for alloc in result.allocations:
        if alloc.warehouse_id is None:
            # Backorder line — no stock to lock
            split_line = FulfillmentSplitLine(
                fulfillment_split_id=split.id,
                quotation_line_id=alloc.quotation_line_id,
                warehouse_id=None,
                quantity_fulfilled=0,
                quantity_backordered=alloc.quantity_backordered,
            )
            db.add(split_line)
            db.flush()
            # Create backorder record
            db.add(Backorder(
                fulfillment_split_line_id=split_line.id,
                quantity_remaining=alloc.quantity_backordered,
                status=BackorderStatus.OPEN,
            ))
            continue

        # Lock the stock row with FOR UPDATE to prevent concurrent overselling
        stock_row = db.execute(
            select(WarehouseStock)
            .where(
                WarehouseStock.warehouse_id == alloc.warehouse_id,
                WarehouseStock.product_id == alloc.product_id,
            )
            .with_for_update()
        ).scalar_one_or_none()

        if stock_row is None:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock not found for product {alloc.product_id} at warehouse {alloc.warehouse_id}")

        available = stock_row.quantity_on_hand - stock_row.reserved_quantity
        if available < alloc.quantity_fulfilled:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail=f"Insufficient stock: product {alloc.product_id} at warehouse {alloc.warehouse_id} has {available} available but {alloc.quantity_fulfilled} requested",
            )

        stock_row.reserved_quantity += alloc.quantity_fulfilled

        split_line = FulfillmentSplitLine(
            fulfillment_split_id=split.id,
            quotation_line_id=alloc.quotation_line_id,
            warehouse_id=alloc.warehouse_id,
            quantity_fulfilled=alloc.quantity_fulfilled,
            quantity_backordered=alloc.quantity_backordered,
        )
        db.add(split_line)

    # Audit
    db.add(AuditLog(
        entity_type="fulfillment_split",
        entity_id=split.id,
        user_id=user.id,
        action="split_accepted",
        reason=f"Accepted split for quotation {payload.quotation_id}",
    ))

    db.commit()
    db.refresh(split)
    return FulfillmentSplitRead.model_validate(split)


# ── Override Split ─────────────────────────────────────────────────────────

@router.post("/override", response_model=FulfillmentSplitRead)
def override_split(
    payload: OverrideSplitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> FulfillmentSplitRead:
    """Manually override a fulfillment split (Admin / FinanceOps only).

    Validates the override doesn't exceed available stock before persisting.
    Rejects with 400 if it does — does not silently clamp.
    """
    quotation = db.get(Quotation, payload.quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")

    split = FulfillmentSplit(
        quotation_id=payload.quotation_id,
        status=FulfillmentStatus.MANUALLY_OVERRIDDEN,
    )
    db.add(split)
    db.flush()

    for line_input in payload.lines:
        # Validate quotation line exists
        ql = db.get(QuotationLine, line_input.quotation_line_id)
        if ql is None or ql.quotation_id != payload.quotation_id:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Quotation line {line_input.quotation_line_id} not found")

        # Validate warehouse exists
        wh = db.get(Warehouse, line_input.warehouse_id)
        if wh is None:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Warehouse {line_input.warehouse_id} not found")

        # Lock stock row
        stock_row = db.execute(
            select(WarehouseStock)
            .where(
                WarehouseStock.warehouse_id == line_input.warehouse_id,
                WarehouseStock.product_id == ql.product_id,
            )
            .with_for_update()
        ).scalar_one_or_none()

        if stock_row is None:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"No stock entry for product {ql.product_id} at warehouse {line_input.warehouse_id}",
            )

        available = stock_row.quantity_on_hand - stock_row.reserved_quantity
        if available < line_input.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Override exceeds available stock: product {ql.product_id} at warehouse {line_input.warehouse_id} has {available} available but {line_input.quantity} requested",
            )

        stock_row.reserved_quantity += line_input.quantity

        split_line = FulfillmentSplitLine(
            fulfillment_split_id=split.id,
            quotation_line_id=line_input.quotation_line_id,
            warehouse_id=line_input.warehouse_id,
            quantity_fulfilled=line_input.quantity,
            quantity_backordered=0,
        )
        db.add(split_line)

    # Audit
    db.add(AuditLog(
        entity_type="fulfillment_split",
        entity_id=split.id,
        user_id=user.id,
        action="split_overridden",
        reason=payload.reason or "Manual override",
    ))

    db.commit()
    db.refresh(split)
    return FulfillmentSplitRead.model_validate(split)


@router.post("/manual-override")
def submit_manual_override(
    payload: ManualOverrideRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> dict:
    """Route a commercial override to approval and preserve its submitted details."""
    quotation = db.get(Quotation, payload.quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")

    quotation.status = QuotationStatus.PENDING_APPROVAL
    reason = (
        f"{payload.override_type}: {payload.current_value} -> {payload.new_value}; "
        f"maximum {payload.allowed_maximum}; approver {payload.approver}; "
        f"reason: {payload.reason}; justification: {payload.business_justification}; "
        f"supporting information: {payload.supporting_information or 'None'}"
    )
    db.add(AuditLog(
        entity_type="manual_override",
        entity_id=quotation.id,
        user_id=user.id,
        action="override_submitted",
        reason=reason,
    ))
    db.commit()
    return {"status": "Pending Approval", "quotation_id": quotation.id, "approver": payload.approver}


# ── Backorders ─────────────────────────────────────────────────────────────

@router.get("/backorders", response_model=list[BackorderRead])
def list_backorders(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> list[BackorderRead]:
    """List all backorders (any internal role)."""
    backorders = db.scalars(select(Backorder)).all()
    return [BackorderRead.model_validate(bo) for bo in backorders]


@router.post("/backorders/{backorder_id}/consolidate", response_model=BackorderRead)
def consolidate_backorder(
    backorder_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> BackorderRead:
    """Consolidate a backorder that's been marked as ready.

    This is the explicit accept step — the Celery task marks backorders
    as consolidation_ready, and a rep must call this endpoint to complete it.
    """
    bo = db.get(Backorder, backorder_id)
    if bo is None:
        raise HTTPException(status_code=404, detail="Backorder not found")

    if bo.status != BackorderStatus.CONSOLIDATION_READY:
        raise HTTPException(
            status_code=400,
            detail=f"Backorder is not ready for consolidation (current status: {bo.status.value})",
        )

    # Find what product and where
    split_line = db.get(FulfillmentSplitLine, bo.fulfillment_split_line_id)
    if split_line is None:
        raise HTTPException(status_code=400, detail="Split line not found")

    ql = db.get(QuotationLine, split_line.quotation_line_id)
    if ql is None:
        raise HTTPException(status_code=400, detail="Quotation line not found")

    # Find a warehouse with stock to cover this backorder
    all_stock = db.scalars(
        select(WarehouseStock)
        .where(WarehouseStock.product_id == ql.product_id)
    ).all()

    # Sort by available (descending) to pick the best warehouse
    best_stock = None
    for stock in sorted(all_stock, key=lambda s: s.quantity_on_hand - s.reserved_quantity, reverse=True):
        avail = stock.quantity_on_hand - stock.reserved_quantity
        if avail >= bo.quantity_remaining:
            best_stock = stock
            break

    if best_stock is None:
        raise HTTPException(status_code=400, detail="Insufficient stock to consolidate backorder")

    # Lock and reserve
    locked_stock = db.execute(
        select(WarehouseStock)
        .where(WarehouseStock.id == best_stock.id)
        .with_for_update()
    ).scalar_one()

    available = locked_stock.quantity_on_hand - locked_stock.reserved_quantity
    if available < bo.quantity_remaining:
        db.rollback()
        raise HTTPException(status_code=409, detail="Stock changed — insufficient for consolidation")

    locked_stock.reserved_quantity += bo.quantity_remaining

    # Update the split line
    split_line.quantity_fulfilled += bo.quantity_remaining
    split_line.quantity_backordered -= bo.quantity_remaining
    if split_line.warehouse_id is None:
        split_line.warehouse_id = locked_stock.warehouse_id

    # Mark backorder as consolidated
    bo.status = BackorderStatus.CONSOLIDATED
    bo.resolved_at = datetime.now(timezone.utc)

    # Audit
    db.add(AuditLog(
        entity_type="backorder",
        entity_id=bo.id,
        user_id=user.id,
        action="backorder_consolidated",
        reason=f"Consolidated {bo.quantity_remaining} units from warehouse {locked_stock.warehouse_id}",
    ))

    db.commit()
    db.refresh(bo)
    return BackorderRead.model_validate(bo)
