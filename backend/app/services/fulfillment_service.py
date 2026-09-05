"""Warehouse fulfillment auto-split engine — Group B.

The core algorithm is in ``compute_suggested_split``, a pure function that
takes plain data and returns plain data so it can be unit-tested without
any database or session coupling.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Plain data types used by the pure algorithm
# ---------------------------------------------------------------------------

@dataclass
class OrderLine:
    """One line from a confirmed order / quotation."""

    quotation_line_id: int
    product_id: int
    quantity_required: int


@dataclass
class StockEntry:
    """Available stock at one warehouse for one product."""

    warehouse_id: int
    warehouse_name: str
    product_id: int
    quantity_available: int          # quantity_on_hand - reserved_quantity
    shipping_cost_weight: float


@dataclass
class SplitAllocation:
    """One allocation decision: product line → warehouse → qty."""

    quotation_line_id: int
    product_id: int
    warehouse_id: int
    warehouse_name: str
    quantity_fulfilled: int
    quantity_backordered: int = 0


@dataclass
class SplitResult:
    """Complete suggested split for an order."""

    allocations: list[SplitAllocation] = field(default_factory=list)
    shipment_count: int = 0
    estimated_cost: float = 0.0
    has_backorders: bool = False


def compute_suggested_split(
    order_lines: list[OrderLine],
    stock_entries: list[StockEntry],
) -> SplitResult:
    """Compute a deterministic fulfillment split that minimises shipment count.

    Algorithm (documented for testability)
    ----------------------------------------
    **Pass 1 — single-warehouse-first**:
        Sort warehouses by ``shipping_cost_weight`` ascending (cheapest first).
        For the first warehouse that can cover **every** line simultaneously
        (i.e. available stock >= quantity_required for each product), assign the
        entire order there.  This gives shipment_count = 1.

    **Pass 2 — multi-warehouse fallback**:
        If no single warehouse can cover everything, process each order line
        independently in stable order (ascending ``quotation_line_id``).  For
        each line, allocate from the cheapest warehouse with available stock
        first, then the next cheapest, and so on, until the line is fully
        covered or all warehouses are exhausted.

    **Pass 3 — backorder**:
        If total available stock across all warehouses for a line is less than
        ``quantity_required``, the shortfall becomes a backorder.

    **Cost formula**:
        ``estimated_cost = sum(shipping_cost_weight for each distinct warehouse
        used in the accepted plan)``.  This is a simple proxy; real shipping
        cost integration is a future extension.

    Lines are processed in ascending ``quotation_line_id`` order so two lines
    competing for the same scarce stock produce deterministic, testable results.
    """
    if not order_lines:
        return SplitResult()

    # Build per-(warehouse, product) available-stock map
    # stock_map[warehouse_id][product_id] -> mutable remaining qty
    stock_map: dict[int, dict[int, int]] = {}
    warehouse_meta: dict[int, tuple[str, float]] = {}  # id -> (name, weight)

    for se in stock_entries:
        avail = max(se.quantity_available, 0)
        stock_map.setdefault(se.warehouse_id, {})[se.product_id] = avail
        warehouse_meta[se.warehouse_id] = (se.warehouse_name, se.shipping_cost_weight)

    if not warehouse_meta:
        # Zero warehouses: everything is backordered
        allocations = []
        for ol in order_lines:
            allocations.append(
                SplitAllocation(
                    quotation_line_id=ol.quotation_line_id,
                    product_id=ol.product_id,
                    warehouse_id=0,
                    warehouse_name="(none)",
                    quantity_fulfilled=0,
                    quantity_backordered=ol.quantity_required,
                )
            )
        return SplitResult(
            allocations=allocations,
            shipment_count=0,
            estimated_cost=0.0,
            has_backorders=True,
        )

    # Sort warehouses by shipping_cost_weight ascending
    sorted_wh_ids = sorted(warehouse_meta, key=lambda wid: warehouse_meta[wid][1])

    # --- Pass 1: single-warehouse-first ---
    # Aggregate total demand per product across ALL lines (multiple lines
    # may reference the same product).
    demand_per_product: dict[int, int] = {}
    for ol in order_lines:
        demand_per_product[ol.product_id] = (
            demand_per_product.get(ol.product_id, 0) + ol.quantity_required
        )

    for wid in sorted_wh_ids:
        wh_stock = stock_map.get(wid, {})
        can_cover_all = True
        for pid, total_qty in demand_per_product.items():
            if wh_stock.get(pid, 0) < total_qty:
                can_cover_all = False
                break
        if can_cover_all:
            wh_name, wh_weight = warehouse_meta[wid]
            allocations = []
            for ol in order_lines:
                allocations.append(
                    SplitAllocation(
                        quotation_line_id=ol.quotation_line_id,
                        product_id=ol.product_id,
                        warehouse_id=wid,
                        warehouse_name=wh_name,
                        quantity_fulfilled=ol.quantity_required,
                        quantity_backordered=0,
                    )
                )
            return SplitResult(
                allocations=allocations,
                shipment_count=1,
                estimated_cost=wh_weight,
                has_backorders=False,
            )

    # --- Pass 2 & 3: multi-warehouse fallback + backorder ---
    # Work on a mutable copy of stock so allocations decrement it
    remaining_stock: dict[int, dict[int, int]] = {
        wid: dict(products) for wid, products in stock_map.items()
    }
    allocations: list[SplitAllocation] = []
    warehouses_used: set[int] = set()
    has_backorders = False

    # Process lines in stable order
    for ol in sorted(order_lines, key=lambda x: x.quotation_line_id):
        still_needed = ol.quantity_required
        for wid in sorted_wh_ids:
            if still_needed <= 0:
                break
            avail = remaining_stock.get(wid, {}).get(ol.product_id, 0)
            if avail <= 0:
                continue
            take = min(avail, still_needed)
            allocations.append(
                SplitAllocation(
                    quotation_line_id=ol.quotation_line_id,
                    product_id=ol.product_id,
                    warehouse_id=wid,
                    warehouse_name=warehouse_meta[wid][0],
                    quantity_fulfilled=take,
                    quantity_backordered=0,
                )
            )
            remaining_stock[wid][ol.product_id] -= take
            still_needed -= take
            warehouses_used.add(wid)

        if still_needed > 0:
            has_backorders = True
            # Record the backorder portion — warehouse_id=0 signals backorder
            allocations.append(
                SplitAllocation(
                    quotation_line_id=ol.quotation_line_id,
                    product_id=ol.product_id,
                    warehouse_id=0,
                    warehouse_name="(backorder)",
                    quantity_fulfilled=0,
                    quantity_backordered=still_needed,
                )
            )

    estimated_cost = sum(warehouse_meta[wid][1] for wid in warehouses_used)
    return SplitResult(
        allocations=allocations,
        shipment_count=len(warehouses_used),
        estimated_cost=estimated_cost,
        has_backorders=has_backorders,
    )
