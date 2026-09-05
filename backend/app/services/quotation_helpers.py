"""Minimal quotation helpers stubbed by Group B.

# TODO(foundation): confirm this matches the real shared model.
# These are additive stubs so Group B endpoints can call
# recalculate_quotation_totals and add_quotation_line without
# reimplementing discount/margin math.  When Group A ships their
# full quotation_service.py, this file should be reconciled or
# removed in favour of theirs.
"""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine


def recalculate_quotation_totals(db: Session, quotation_id: int) -> dict:
    """Re-sum line_total for every line on a quotation and return totals.

    # TODO(foundation): the real version should apply tier pricing,
    # discount engine, and margin calculations.  This stub only sums
    # existing line_total values.
    """
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        raise ValueError(f"Quotation {quotation_id} not found")

    lines = db.scalars(
        select(QuotationLine).where(QuotationLine.quotation_id == quotation_id)
    ).all()
    subtotal = sum((line.line_total for line in lines), Decimal("0.00"))
    return {
        "quotation_id": quotation_id,
        "total_lines": len(lines),
        "subtotal": subtotal,
    }


def add_quotation_line(
    db: Session,
    quotation_id: int,
    product_id: int,
    quantity: int,
) -> QuotationLine:
    """Create a QuotationLine using Product.base_price as the unit price.

    # TODO(foundation): the real version should resolve the price through
    # the pricing service (tier/currency/discount).  This stub uses
    # base_price directly.

    If a line for the same product already exists on the quotation,
    the quantity is incremented instead of creating a duplicate.
    """
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        raise ValueError(f"Quotation {quotation_id} not found")

    product = db.get(Product, product_id)
    if product is None:
        raise ValueError(f"Product {product_id} not found")

    # Check for existing line with same product
    existing_line = db.scalar(
        select(QuotationLine).where(
            QuotationLine.quotation_id == quotation_id,
            QuotationLine.product_id == product_id,
        )
    )

    if existing_line is not None:
        # Increment quantity on existing line
        existing_line.quantity += quantity
        existing_line.line_total = existing_line.unit_price * existing_line.quantity
        db.flush()
        return existing_line

    unit_price = product.base_price
    discount_percent = Decimal("0.00")
    line_total = unit_price * quantity

    line = QuotationLine(
        quotation_id=quotation_id,
        product_id=product_id,
        quantity=Decimal(str(quantity)),
        unit_price=unit_price,
        discount_percent=discount_percent,
        line_total=line_total,
        category_snapshot=product.category,
    )
    db.add(line)
    db.flush()
    return line
