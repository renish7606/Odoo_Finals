"""Tests for the upsell / cross-sell engine — Group B.

Covers: margin threshold filtering, promotion ranking boost, empty pairing
rules, add-suggestion flow, duplicate handling, and RBAC (portal rejection).
"""

from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.customer import Customer, CustomerTier
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig
from app.models.user import User

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def _cleanup(db):
    """Remove test data in correct dependency order."""
    db.query(AuditLog).delete()
    db.query(QuotationLine).delete()
    db.query(Quotation).delete()
    db.query(ProductPairingRule).delete()
    db.query(ProductPromotion).delete()
    db.query(UpsellConfig).delete()
    db.query(Product).delete()
    db.query(Customer).delete()
    db.query(User).delete()
    db.commit()


def _seed_test_data(db):
    """Create users, products, quotation, and upsell rules for testing.

    Returns a dict of plain IDs (not ORM objects) so they remain valid
    after the session is closed.
    """
    # Users
    admin = User(email="test_admin@test.com", full_name="Test Admin", role=Role.ADMIN,
                 hashed_password=hash_password("TestPass1!"))
    rep = User(email="test_rep@test.com", full_name="Test Rep", role=Role.SALES_REP,
               hashed_password=hash_password("TestPass1!"))
    finance = User(email="test_finance@test.com", full_name="Test Finance", role=Role.FINANCE_OPS,
                   hashed_password=hash_password("TestPass1!"))
    db.add_all([admin, rep, finance])
    db.flush()

    # Customer
    customer = Customer(name="Test Customer", email="test_customer@test.com", tier=CustomerTier.SILVER)
    db.add(customer)
    db.flush()

    # Products
    p1 = Product(name="TestProduct_A", category="TestCat", base_price=Decimal("100.00"), unit="each", tax_rate=Decimal("18.00"))
    p2 = Product(name="TestProduct_B", category="TestCat", base_price=Decimal("200.00"), unit="each", tax_rate=Decimal("18.00"))
    p3 = Product(name="TestProduct_C", category="TestCat", base_price=Decimal("50.00"), unit="each", tax_rate=Decimal("18.00"))
    p4 = Product(name="TestProduct_D", category="TestCat", base_price=Decimal("10.00"), unit="each", tax_rate=Decimal("18.00"))
    db.add_all([p1, p2, p3, p4])
    db.flush()

    # Quotation with one line (product A)
    q = Quotation(customer_id=customer.id, rep_id=rep.id, status=QuotationStatus.DRAFT)
    db.add(q)
    db.flush()
    ql = QuotationLine(quotation_id=q.id, product_id=p1.id, quantity=Decimal("2"),
                       unit_price=p1.base_price, discount_percent=Decimal("0"), line_total=p1.base_price * 2)
    db.add(ql)
    db.flush()

    # Pairing rules: A -> B (high score), A -> C (low score), A -> D (very low margin)
    r1 = ProductPairingRule(base_product_id=p1.id, suggested_product_id=p2.id, co_purchase_score=0.8)
    r2 = ProductPairingRule(base_product_id=p1.id, suggested_product_id=p3.id, co_purchase_score=0.8)
    r3 = ProductPairingRule(base_product_id=p1.id, suggested_product_id=p4.id, co_purchase_score=0.5)
    db.add_all([r1, r2, r3])
    db.flush()

    # Capture all IDs before commit/close
    data = {
        "admin_id": admin.id, "rep_id": rep.id, "finance_id": finance.id,
        "customer_id": customer.id,
        "p1_id": p1.id, "p2_id": p2.id, "p3_id": p3.id, "p4_id": p4.id,
        "quotation_id": q.id,
    }
    db.commit()
    return data


def _token_for_id(user_id: int) -> str:
    return create_access_token(str(user_id), scope="internal")


def _portal_token() -> str:
    return create_access_token("999", scope="portal")


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── Tests ──────────────────────────────────────────────────────────────────

class TestUpsellSuggestions:
    """Test the core suggestion endpoint."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup(db)
        self.data = _seed_test_data(db)
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup(db)
        db.close()

    def test_suggestions_filtered_by_margin_threshold(self):
        """Suggestions below the margin threshold are excluded."""
        db = SessionLocal()
        config = db.scalar(select(UpsellConfig).where(UpsellConfig.key == "minimum_margin_threshold"))
        if config is None:
            config = UpsellConfig(key="minimum_margin_threshold", value="20.0")
            db.add(config)
        else:
            config.value = "20.0"
        db.commit()
        db.close()

        token = _token_for_id(self.data["rep_id"])
        resp = client.get(
            f"/api/v1/upsell/suggestions?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 200
        suggestions = resp.json()
        product_ids = [s["product_id"] for s in suggestions]
        # Product D (base_price=10) should be excluded
        assert self.data["p4_id"] not in product_ids
        # Products B (200) and C (50) should remain
        assert self.data["p2_id"] in product_ids
        assert self.data["p3_id"] in product_ids

    def test_promoted_products_rank_above_non_promoted(self):
        """A promoted product with the same co_purchase_score ranks higher."""
        db = SessionLocal()
        promo = ProductPromotion(product_id=self.data["p3_id"], is_promoted=True, promo_label="Hot Deal")
        db.add(promo)
        db.commit()
        db.close()

        token = _token_for_id(self.data["rep_id"])
        resp = client.get(
            f"/api/v1/upsell/suggestions?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 200
        suggestions = resp.json()
        assert len(suggestions) >= 2

        c_suggestion = next(s for s in suggestions if s["product_id"] == self.data["p3_id"])
        b_suggestion = next(s for s in suggestions if s["product_id"] == self.data["p2_id"])

        # C is promoted (score = 0.8 * 1.5 = 1.2), B is not (score = 0.8 * 1.0 = 0.8)
        assert c_suggestion["rank"] < b_suggestion["rank"]
        assert c_suggestion["is_promoted"] is True
        assert c_suggestion["promo_label"] == "Hot Deal"

    def test_no_pairing_rules_returns_empty_200(self):
        """No pairing rules → 200 with empty list, not an error."""
        db = SessionLocal()
        db.query(ProductPairingRule).delete()
        db.commit()
        db.close()

        token = _token_for_id(self.data["rep_id"])
        resp = client.get(
            f"/api/v1/upsell/suggestions?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 200
        assert resp.json() == []

    def test_add_suggestion_creates_line_and_returns_totals(self):
        """Adding a suggestion creates a QuotationLine and returns updated totals."""
        token = _token_for_id(self.data["rep_id"])
        resp = client.post(
            "/api/v1/upsell/suggestions/add",
            json={
                "quotation_id": self.data["quotation_id"],
                "product_id": self.data["p2_id"],
                "quantity": 1,
            },
            headers=_auth(token),
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["quotation_id"] == self.data["quotation_id"]
        assert body["total_lines"] == 2  # original + new
        assert body["message"] == "Suggestion added and totals recalculated"

    def test_duplicate_suggestion_increments_quantity(self):
        """Adding a product already in the cart increments its quantity."""
        token = _token_for_id(self.data["rep_id"])
        # p1 is already in the cart with qty=2
        resp = client.post(
            "/api/v1/upsell/suggestions/add",
            json={
                "quotation_id": self.data["quotation_id"],
                "product_id": self.data["p1_id"],
                "quantity": 3,
            },
            headers=_auth(token),
        )
        assert resp.status_code == 200
        body = resp.json()
        # Still 1 line (quantity incremented, not duplicated)
        assert body["total_lines"] == 1

    def test_portal_token_rejected_on_suggestions(self):
        """A portal-scoped JWT is rejected on every upsell route."""
        token = _portal_token()
        resp = client.get(
            f"/api/v1/upsell/suggestions?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_portal_token_rejected_on_add(self):
        """A portal-scoped JWT is rejected on the add-suggestion route."""
        token = _portal_token()
        resp = client.post(
            "/api/v1/upsell/suggestions/add",
            json={"quotation_id": 1, "product_id": 1, "quantity": 1},
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_portal_token_rejected_on_pairing_rules(self):
        """A portal-scoped JWT is rejected on pairing-rules CRUD."""
        token = _portal_token()
        resp = client.get("/api/v1/upsell/pairing-rules", headers=_auth(token))
        assert resp.status_code == 403

    def test_portal_token_rejected_on_promotions(self):
        """A portal-scoped JWT is rejected on promotions CRUD."""
        token = _portal_token()
        resp = client.get("/api/v1/upsell/promotions", headers=_auth(token))
        assert resp.status_code == 403

    def test_quotation_not_found_returns_404(self):
        """Requesting suggestions for a nonexistent quotation returns 404."""
        token = _token_for_id(self.data["rep_id"])
        resp = client.get(
            "/api/v1/upsell/suggestions?quotation_id=99999",
            headers=_auth(token),
        )
        assert resp.status_code == 404


class TestUpsellCrud:
    """Test CRUD endpoints for pairing rules, promotions, and config."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup(db)
        self.data = _seed_test_data(db)
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup(db)
        db.close()

    def test_create_pairing_rule(self):
        token = _token_for_id(self.data["admin_id"])
        resp = client.post(
            "/api/v1/upsell/pairing-rules",
            json={
                "base_product_id": self.data["p2_id"],
                "suggested_product_id": self.data["p3_id"],
                "co_purchase_score": 0.9,
            },
            headers=_auth(token),
        )
        assert resp.status_code == 201
        assert resp.json()["co_purchase_score"] == 0.9

    def test_sales_rep_cannot_write_pairing_rules(self):
        token = _token_for_id(self.data["rep_id"])
        resp = client.post(
            "/api/v1/upsell/pairing-rules",
            json={
                "base_product_id": self.data["p2_id"],
                "suggested_product_id": self.data["p3_id"],
                "co_purchase_score": 0.9,
            },
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_update_config(self):
        token = _token_for_id(self.data["finance_id"])
        resp = client.put(
            "/api/v1/upsell/config",
            json={"minimum_margin_threshold": 25.0},
            headers=_auth(token),
        )
        assert resp.status_code == 200
        assert resp.json()["minimum_margin_threshold"] == 25.0

    def test_create_promotion(self):
        token = _token_for_id(self.data["admin_id"])
        resp = client.post(
            "/api/v1/upsell/promotions",
            json={"product_id": self.data["p2_id"], "is_promoted": True, "promo_label": "Sale"},
            headers=_auth(token),
        )
        assert resp.status_code == 201
        assert resp.json()["promo_label"] == "Sale"
