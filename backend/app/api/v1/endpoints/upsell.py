"""Upsell / cross-sell API endpoints — Group B.

Auto-discovered by ``app.api.v1.api.build_api_router`` because this module
exports a module-level ``router = APIRouter(...)``.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.product import Product
from app.models.quotation import Quotation
from app.models.role import Role
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig
from app.models.user import User
from app.schemas.upsell import (
    AddSuggestionRequest,
    PairingRuleCreate,
    PairingRuleRead,
    PairingRuleUpdate,
    PromotionCreate,
    PromotionRead,
    PromotionUpdate,
    QuotationTotalsResponse,
    UpsellConfigRead,
    UpsellConfigUpdate,
    UpsellSuggestion,
)
from app.services.quotation_helpers import add_quotation_line, recalculate_quotation_totals
from app.services.upsell_service import get_upsell_suggestions

router = APIRouter(prefix="/upsell", tags=["upsell"])

# Roles allowed to write config/rules/promotions
_WRITE_ROLES = (Role.FINANCE_OPS.value, Role.ADMIN.value)
# All internal roles (reads)
_ALL_INTERNAL = (
    Role.SALES_REP.value,
    Role.SALES_MANAGER.value,
    Role.FINANCE_OPS.value,
    Role.ADMIN.value,
)


# ── Pairing Rules ──────────────────────────────────────────────────────────

@router.post("/pairing-rules", response_model=PairingRuleRead, status_code=201)
def create_pairing_rule(
    payload: PairingRuleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> PairingRuleRead:
    """Create a product-pairing rule (Admin / FinanceOps only)."""
    # Validate products exist
    if db.get(Product, payload.base_product_id) is None:
        raise HTTPException(status_code=404, detail="Base product not found")
    if db.get(Product, payload.suggested_product_id) is None:
        raise HTTPException(status_code=404, detail="Suggested product not found")
    rule = ProductPairingRule(**payload.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return PairingRuleRead.model_validate(rule)


@router.get("/pairing-rules", response_model=list[PairingRuleRead])
def list_pairing_rules(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> list[PairingRuleRead]:
    """List all pairing rules (any internal role)."""
    rules = db.scalars(select(ProductPairingRule)).all()
    return [PairingRuleRead.model_validate(r) for r in rules]


@router.patch("/pairing-rules/{rule_id}", response_model=PairingRuleRead)
def update_pairing_rule(
    rule_id: int,
    payload: PairingRuleUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> PairingRuleRead:
    """Update a pairing rule (Admin / FinanceOps only)."""
    rule = db.get(ProductPairingRule, rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Pairing rule not found")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field_name, value)
    db.commit()
    db.refresh(rule)
    return PairingRuleRead.model_validate(rule)


@router.delete("/pairing-rules/{rule_id}", status_code=204)
def delete_pairing_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> None:
    """Delete a pairing rule (Admin / FinanceOps only)."""
    rule = db.get(ProductPairingRule, rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Pairing rule not found")
    db.delete(rule)
    db.commit()


# ── Promotions ─────────────────────────────────────────────────────────────

@router.post("/promotions", response_model=PromotionRead, status_code=201)
def create_promotion(
    payload: PromotionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> PromotionRead:
    """Flag a product as promoted (Admin / FinanceOps only)."""
    if db.get(Product, payload.product_id) is None:
        raise HTTPException(status_code=404, detail="Product not found")
    # Check uniqueness
    existing = db.scalar(
        select(ProductPromotion).where(ProductPromotion.product_id == payload.product_id)
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Promotion already exists for this product")
    promo = ProductPromotion(**payload.model_dump())
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return PromotionRead.model_validate(promo)


@router.get("/promotions", response_model=list[PromotionRead])
def list_promotions(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> list[PromotionRead]:
    """List all promotions (any internal role)."""
    promos = db.scalars(select(ProductPromotion)).all()
    return [PromotionRead.model_validate(p) for p in promos]


@router.patch("/promotions/{promo_id}", response_model=PromotionRead)
def update_promotion(
    promo_id: int,
    payload: PromotionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> PromotionRead:
    """Update a promotion (Admin / FinanceOps only)."""
    promo = db.get(ProductPromotion, promo_id)
    if promo is None:
        raise HTTPException(status_code=404, detail="Promotion not found")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(promo, field_name, value)
    db.commit()
    db.refresh(promo)
    return PromotionRead.model_validate(promo)


@router.delete("/promotions/{promo_id}", status_code=204)
def delete_promotion(
    promo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> None:
    """Delete a promotion (Admin / FinanceOps only)."""
    promo = db.get(ProductPromotion, promo_id)
    if promo is None:
        raise HTTPException(status_code=404, detail="Promotion not found")
    db.delete(promo)
    db.commit()


# ── Upsell Config ──────────────────────────────────────────────────────────

@router.get("/config", response_model=UpsellConfigRead)
def get_config(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> UpsellConfigRead:
    """Read the upsell engine configuration (Admin / FinanceOps only)."""
    row = db.scalar(
        select(UpsellConfig).where(UpsellConfig.key == "minimum_margin_threshold")
    )
    threshold = float(row.value) if row else 0.0
    return UpsellConfigRead(minimum_margin_threshold=threshold)


@router.put("/config", response_model=UpsellConfigRead)
def update_config(
    payload: UpsellConfigUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_WRITE_ROLES)),
) -> UpsellConfigRead:
    """Set the minimum margin threshold (Admin / FinanceOps only)."""
    row = db.scalar(
        select(UpsellConfig).where(UpsellConfig.key == "minimum_margin_threshold")
    )
    if row is None:
        row = UpsellConfig(key="minimum_margin_threshold", value=str(payload.minimum_margin_threshold))
        db.add(row)
    else:
        row.value = str(payload.minimum_margin_threshold)
    db.commit()
    return UpsellConfigRead(minimum_margin_threshold=payload.minimum_margin_threshold)


# ── Suggestions ────────────────────────────────────────────────────────────

@router.get("/suggestions", response_model=list[UpsellSuggestion])
def suggestions(
    quotation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> list[UpsellSuggestion]:
    """Return ranked upsell suggestions for a quotation (any internal role)."""
    quotation = db.get(Quotation, quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")
    raw = get_upsell_suggestions(db, quotation_id)
    return [UpsellSuggestion(**s) for s in raw]


@router.post("/suggestions/add", response_model=QuotationTotalsResponse)
def add_suggestion(
    payload: AddSuggestionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*_ALL_INTERNAL)),
) -> QuotationTotalsResponse:
    """Add a suggested product to a quotation and return updated totals.

    Ownership check: SalesReps can only add to their own quotations.
    SalesManagers and above can add to any quotation.
    """
    quotation = db.get(Quotation, payload.quotation_id)
    if quotation is None:
        raise HTTPException(status_code=404, detail="Quotation not found")

    # Ownership / authorization check
    if user.role == Role.SALES_REP and quotation.rep_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this quotation")

    product = db.get(Product, payload.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        add_quotation_line(db, payload.quotation_id, payload.product_id, payload.quantity)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Audit
    db.add(AuditLog(
        entity_type="quotation",
        entity_id=payload.quotation_id,
        user_id=user.id,
        action="upsell_added",
        reason=f"Added product {payload.product_id} qty {payload.quantity}",
    ))

    db.commit()

    totals = recalculate_quotation_totals(db, payload.quotation_id)
    return QuotationTotalsResponse(
        quotation_id=totals["quotation_id"],
        total_lines=totals["total_lines"],
        subtotal=totals["subtotal"],
        message="Suggestion added and totals recalculated",
    )
