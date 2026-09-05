"""Upsell and cross-sell suggestion engine — Group B."""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig


def _get_minimum_margin_threshold(db: Session) -> float:
    """Read the configured minimum margin threshold (default 0)."""
    row = db.scalar(
        select(UpsellConfig).where(UpsellConfig.key == "minimum_margin_threshold")
    )
    if row is None:
        return 0.0
    try:
        return float(row.value)
    except (ValueError, TypeError):
        return 0.0


def get_upsell_suggestions(
    db: Session, quotation_id: int
) -> list[dict]:
    """Return ranked upsell suggestions for a quotation's current cart.

    Algorithm
    ---------
    1. Load the quotation's current line items (product ids).
    2. For each cart product, find pairing rules where base_product_id matches.
    3. Filter out suggestions already present in the cart.
    4. Compute margin_delta = suggested_product.base_price (treated as revenue
       contribution since there is no cost field on Product — see NOTES.md).
    5. Filter out suggestions below upsell_config.minimum_margin_threshold.
    6. Rank by composite score:
         score = co_purchase_score * (1.5 if promoted else 1.0)
       Promoted products are boosted by 50 % to rank above equivalent
       non-promoted ones.
    7. Deduplicate: if the same suggested product appears via multiple cart
       products, keep the highest-scoring occurrence.
    8. Return sorted by score descending, with rank 1 = best.
    """
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        return []

    # Current cart product ids
    cart_lines = db.scalars(
        select(QuotationLine).where(QuotationLine.quotation_id == quotation_id)
    ).all()
    cart_product_ids: set[int] = {line.product_id for line in cart_lines}

    if not cart_product_ids:
        return []

    # Load pairing rules for cart products
    pairing_rules = db.scalars(
        select(ProductPairingRule).where(
            ProductPairingRule.base_product_id.in_(cart_product_ids)
        )
    ).all()

    if not pairing_rules:
        return []

    # Load promotions for quick lookup
    now = datetime.now(timezone.utc)
    promotions_map: dict[int, ProductPromotion] = {}
    promos = db.scalars(select(ProductPromotion)).all()
    for promo in promos:
        # Only consider active promotions
        if promo.is_promoted:
            if promo.starts_at and promo.starts_at > now:
                continue
            if promo.ends_at and promo.ends_at < now:
                continue
            promotions_map[promo.product_id] = promo

    threshold = _get_minimum_margin_threshold(db)

    # Build candidate map: suggested_product_id -> best entry
    candidates: dict[int, dict] = {}

    for rule in pairing_rules:
        suggested_id = rule.suggested_product_id

        # Skip if already in cart
        if suggested_id in cart_product_ids:
            continue

        product = db.get(Product, suggested_id)
        if product is None:
            continue

        # Margin delta: treat base_price as the revenue contribution
        margin_delta = product.base_price

        # Apply threshold filter
        if float(margin_delta) < threshold:
            continue

        # Compute composite score
        promo = promotions_map.get(suggested_id)
        is_promoted = promo is not None
        promo_label = promo.promo_label if promo else None
        score = rule.co_purchase_score * (1.5 if is_promoted else 1.0)

        # Keep best score per suggested product
        if suggested_id not in candidates or score > candidates[suggested_id]["score"]:
            candidates[suggested_id] = {
                "product_id": suggested_id,
                "product_name": product.name,
                "base_price": product.base_price,
                "margin_delta": margin_delta,
                "is_promoted": is_promoted,
                "promo_label": promo_label,
                "score": score,
            }

    # Sort by score descending and assign ranks
    sorted_suggestions = sorted(candidates.values(), key=lambda c: c["score"], reverse=True)
    for i, suggestion in enumerate(sorted_suggestions, start=1):
        suggestion["rank"] = i

    return sorted_suggestions
