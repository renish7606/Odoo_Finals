"""Celery tasks for fulfillment backorder consolidation — Group B.

When warehouse stock is replenished, this task checks whether any open
backorders can now be satisfied and marks them as consolidation-ready so
a rep can explicitly accept the consolidation.
"""

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.fulfillment import (
    Backorder,
    BackorderStatus,
    FulfillmentSplitLine,
)
from app.models.warehouse_stock import WarehouseStock
from app.models.audit_log import AuditLog

from sqlalchemy import or_, select


@celery_app.task(name="check_backorder_consolidation")
def check_backorder_consolidation(warehouse_id: int, product_id: int) -> dict:
    """Check open backorders for a warehouse/product and mark them consolidation-ready.

    This runs asynchronously after a replenishment event.  It does NOT
    auto-commit the consolidation — it marks backorders as
    ``consolidation_ready`` so the rep sees a prompt and can accept via
    ``POST /fulfillment/backorders/{id}/consolidate``.

    Returns a dict with counts for observability.
    """
    db = SessionLocal()
    try:
        # Find current available stock at the replenished warehouse
        stock = db.scalar(
            select(WarehouseStock).where(
                WarehouseStock.warehouse_id == warehouse_id,
                WarehouseStock.product_id == product_id,
            )
        )

        if stock is None:
            return {"checked": 0, "marked_ready": 0}

        available = stock.quantity_on_hand - stock.reserved_quantity

        if available <= 0:
            return {"checked": 0, "marked_ready": 0}

        # Find open backorders for this product via fulfillment split lines
        # that reference this warehouse (or any warehouse — we match on product)
        open_backorders = db.scalars(
            select(Backorder)
            .join(FulfillmentSplitLine)
            .where(
                Backorder.status == BackorderStatus.OPEN,
                or_(
                    FulfillmentSplitLine.warehouse_id == warehouse_id,
                    FulfillmentSplitLine.warehouse_id.is_(None),
                ),
            )
        ).all()

        # Filter to backorders whose split line references our product
        relevant_backorders = []
        for bo in open_backorders:
            split_line = db.get(FulfillmentSplitLine, bo.fulfillment_split_line_id)
            if split_line is None:
                continue
            from app.models.quotation import QuotationLine
            ql = db.get(QuotationLine, split_line.quotation_line_id)
            if ql and ql.product_id == product_id:
                relevant_backorders.append(bo)

        marked = 0
        for bo in relevant_backorders:
            if available >= bo.quantity_remaining:
                bo.status = BackorderStatus.CONSOLIDATION_READY
                marked += 1

        if marked > 0:
            db.commit()

        return {"checked": len(relevant_backorders), "marked_ready": marked}
    finally:
        db.close()
