"""Warehouse CRUD and stock management endpoints — Group B.

Auto-discovered by ``app.api.v1.api.build_api_router``.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.product import Product
from app.models.role import Role
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock
from app.schemas.fulfillment import (
    ReplenishRequest,
    ShippingWeightUpdate,
    StockCreate,
    StockRead,
    StockUpdate,
    WarehouseCreate,
    WarehouseRead,
    WarehouseUpdate,
)

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

_WRITE_ROLES = (Role.FINANCE_OPS.value, Role.ADMIN.value)
_ALL_INTERNAL = (
    Role.SALES_REP.value,
    Role.SALES_MANAGER.value,
    Role.FINANCE_OPS.value,
    Role.ADMIN.value,
)


# ── Warehouse CRUD ─────────────────────────────────────────────────────────

@router.post("", response_model=WarehouseRead, status_code=201)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> WarehouseRead:
    """Create a warehouse (Admin / FinanceOps only)."""
    existing = db.scalar(select(Warehouse).where(Warehouse.name == payload.name))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Warehouse name already exists")
    wh = Warehouse(**payload.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return WarehouseRead.model_validate(wh)


@router.get("", response_model=list[WarehouseRead])
def list_warehouses(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> list[WarehouseRead]:
    """List all warehouses (any internal role)."""
    warehouses = db.scalars(select(Warehouse)).all()
    return [WarehouseRead.model_validate(w) for w in warehouses]


@router.get("/{warehouse_id}", response_model=WarehouseRead)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> WarehouseRead:
    """Get a warehouse by ID (any internal role)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return WarehouseRead.model_validate(wh)


@router.patch("/{warehouse_id}", response_model=WarehouseRead)
def update_warehouse(
    warehouse_id: int,
    payload: WarehouseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> WarehouseRead:
    """Update a warehouse (Admin / FinanceOps only)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(wh, field_name, value)
    db.commit()
    db.refresh(wh)
    return WarehouseRead.model_validate(wh)


@router.delete("/{warehouse_id}", status_code=204)
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> None:
    """Delete a warehouse (Admin / FinanceOps only)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(wh)
    db.commit()


# ── Stock ──────────────────────────────────────────────────────────────────

@router.get("/{warehouse_id}/stock", response_model=list[StockRead])
def list_stock(
    warehouse_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> list[StockRead]:
    """List stock at a warehouse (Admin / FinanceOps only)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    entries = db.scalars(
        select(WarehouseStock).where(WarehouseStock.warehouse_id == warehouse_id)
    ).all()
    return [StockRead.model_validate(e) for e in entries]


@router.post("/{warehouse_id}/stock", response_model=StockRead, status_code=201)
def create_stock(
    warehouse_id: int,
    payload: StockCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> StockRead:
    """Add stock for a product at a warehouse (Admin / FinanceOps only)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if db.get(Product, payload.product_id) is None:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.scalar(
        select(WarehouseStock).where(
            WarehouseStock.warehouse_id == warehouse_id,
            WarehouseStock.product_id == payload.product_id,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Stock entry already exists for this product at this warehouse")
    entry = WarehouseStock(warehouse_id=warehouse_id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return StockRead.model_validate(entry)


@router.patch("/{warehouse_id}/stock/{stock_id}", response_model=StockRead)
def update_stock(
    warehouse_id: int,
    stock_id: int,
    payload: StockUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> StockRead:
    """Update stock for a product (Admin / FinanceOps only)."""
    entry = db.get(WarehouseStock, stock_id)
    if entry is None or entry.warehouse_id != warehouse_id:
        raise HTTPException(status_code=404, detail="Stock entry not found")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field_name, value)
    db.commit()
    db.refresh(entry)
    return StockRead.model_validate(entry)


# ── Shipping Weight ────────────────────────────────────────────────────────

@router.patch("/{warehouse_id}/shipping-weight", response_model=WarehouseRead)
def update_shipping_weight(
    warehouse_id: int,
    payload: ShippingWeightUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> WarehouseRead:
    """Update shipping cost weight for a warehouse (Admin / FinanceOps only)."""
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    wh.shipping_cost_weight = payload.shipping_cost_weight
    db.commit()
    db.refresh(wh)
    return WarehouseRead.model_validate(wh)


# ── Replenishment ──────────────────────────────────────────────────────────

@router.post("/{warehouse_id}/stock/replenish", response_model=StockRead)
def replenish_stock(
    warehouse_id: int,
    payload: ReplenishRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> StockRead:
    """Increase stock at a warehouse and trigger backorder consolidation check.

    This is the trigger point for the Celery task that checks whether
    any open backorders can now be satisfied.
    """
    wh = db.get(Warehouse, warehouse_id)
    if wh is None:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    entry = db.scalar(
        select(WarehouseStock).where(
            WarehouseStock.warehouse_id == warehouse_id,
            WarehouseStock.product_id == payload.product_id,
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Stock entry not found for this product at this warehouse")

    entry.quantity_on_hand += payload.quantity
    db.add(AuditLog(
        entity_type="warehouse_stock",
        entity_id=entry.id,
        user_id=user.id,
        action="stock_replenished",
        reason=f"Added {payload.quantity} units of product {payload.product_id}",
    ))
    db.commit()
    db.refresh(entry)

    # Enqueue async backorder consolidation check
    try:
        from app.tasks.fulfillment_tasks import check_backorder_consolidation
        check_backorder_consolidation.delay(warehouse_id, payload.product_id)
    except Exception:
        # If Redis/Celery isn't available, log but don't fail the request
        pass

    return StockRead.model_validate(entry)
