"""Tests for the warehouse and fulfillment engine — Group B.

Covers: single-warehouse fulfillment, forced multi-warehouse split,
backorder consolidation, manual override rejection, RBAC enforcement,
and concurrency safety.
"""

import threading
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.audit_log import AuditLog
from app.models.customer import Customer, CustomerTier
from app.models.fulfillment import (
    Backorder,
    BackorderStatus,
    FulfillmentSplit,
    FulfillmentSplitLine,
)
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock
from app.services.fulfillment_service import (
    OrderLine,
    StockEntry,
    compute_suggested_split,
)

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────────

def _cleanup(db):
    """Remove test data in correct dependency order."""
    db.query(Backorder).delete()
    db.query(FulfillmentSplitLine).delete()
    db.query(FulfillmentSplit).delete()
    db.query(AuditLog).delete()
    db.query(WarehouseStock).delete()
    db.query(Warehouse).delete()
    db.query(QuotationLine).delete()
    db.query(Quotation).delete()
    db.query(Product).filter(Product.name.like("FFProduct_%")).delete(synchronize_session=False)
    db.query(Customer).filter(Customer.email == "ff_customer@test.com").delete(synchronize_session=False)
    db.query(User).filter(User.email.like("ff_%@test.com")).delete(synchronize_session=False)
    db.commit()


def _cleanup_concurrency_data(db):
    """Remove only records created by the concurrency scenario."""
    db.query(Backorder).delete()
    db.query(FulfillmentSplitLine).delete()
    db.query(FulfillmentSplit).delete()
    db.query(WarehouseStock).filter(WarehouseStock.product_id.in_(
        db.query(Product.id).filter(Product.name == "ConcProduct")
    )).delete(synchronize_session=False)
    db.query(Warehouse).filter(Warehouse.name == "ConcWH").delete(synchronize_session=False)
    db.query(QuotationLine).delete(synchronize_session=False)
    db.query(Quotation).filter(Quotation.rep_id.in_(
        db.query(User.id).filter(User.email == "conc_admin@test.com")
    )).delete(synchronize_session=False)
    db.query(AuditLog).filter(AuditLog.user_id.in_(
        db.query(User.id).filter(User.email == "conc_admin@test.com")
    )).delete(synchronize_session=False)
    db.query(Product).filter(Product.name == "ConcProduct").delete(synchronize_session=False)
    db.query(Customer).filter(Customer.email == "conc_cust@test.com").delete(synchronize_session=False)
    db.query(User).filter(User.email == "conc_admin@test.com").delete(synchronize_session=False)
    db.commit()


def _seed_fulfillment_data(db):
    """Create users, products, quotation, warehouses, and stock.

    Returns a dict of plain IDs so they remain valid after session close.
    """
    # Users
    admin = User(email="ff_admin@test.com", full_name="FF Admin", role=Role.ADMIN,
                 hashed_password=hash_password("TestPass1!"))
    rep = User(email="ff_rep@test.com", full_name="FF Rep", role=Role.SALES_REP,
               hashed_password=hash_password("TestPass1!"))
    finance = User(email="ff_finance@test.com", full_name="FF Finance", role=Role.FINANCE_OPS,
                   hashed_password=hash_password("TestPass1!"))
    db.add_all([admin, rep, finance])
    db.flush()

    customer = Customer(name="FF Customer", email="ff_customer@test.com", tier=CustomerTier.SILVER)
    db.add(customer)
    db.flush()

    p1 = Product(name="FFProduct_A", category="FFCat", base_price=Decimal("100.00"), unit="each", tax_rate=Decimal("18.00"))
    p2 = Product(name="FFProduct_B", category="FFCat", base_price=Decimal("200.00"), unit="each", tax_rate=Decimal("18.00"))
    db.add_all([p1, p2])
    db.flush()

    q = Quotation(customer_id=customer.id, rep_id=rep.id, status=QuotationStatus.CONFIRMED)
    db.add(q)
    db.flush()

    ql1 = QuotationLine(quotation_id=q.id, product_id=p1.id, quantity=Decimal("10"),
                        unit_price=p1.base_price, discount_percent=Decimal("0"), line_total=p1.base_price * 10)
    ql2 = QuotationLine(quotation_id=q.id, product_id=p2.id, quantity=Decimal("5"),
                        unit_price=p2.base_price, discount_percent=Decimal("0"), line_total=p2.base_price * 5)
    db.add_all([ql1, ql2])
    db.flush()

    wh1 = Warehouse(name="FF_WH_Cheap", location="City A", shipping_cost_weight=1.0)
    wh2 = Warehouse(name="FF_WH_Expensive", location="City B", shipping_cost_weight=5.0)
    db.add_all([wh1, wh2])
    db.flush()

    db.add_all([
        WarehouseStock(warehouse_id=wh1.id, product_id=p1.id, quantity_on_hand=20, reserved_quantity=0),
        WarehouseStock(warehouse_id=wh1.id, product_id=p2.id, quantity_on_hand=10, reserved_quantity=0),
        WarehouseStock(warehouse_id=wh2.id, product_id=p1.id, quantity_on_hand=5, reserved_quantity=0),
        WarehouseStock(warehouse_id=wh2.id, product_id=p2.id, quantity_on_hand=3, reserved_quantity=0),
    ])

    data = {
        "admin_id": admin.id, "rep_id": rep.id, "finance_id": finance.id,
        "customer_id": customer.id,
        "p1_id": p1.id, "p2_id": p2.id,
        "quotation_id": q.id, "ql1_id": ql1.id, "ql2_id": ql2.id,
        "wh1_id": wh1.id, "wh2_id": wh2.id,
    }
    db.commit()
    return data


def _token_for_id(user_id: int) -> str:
    return create_access_token(str(user_id), scope="internal")


def _portal_token() -> str:
    return create_access_token("999", scope="portal")


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── Pure Algorithm Tests ───────────────────────────────────────────────────

class TestComputeSuggestedSplit:
    """Unit tests for the pure fulfillment algorithm."""

    def test_single_warehouse_fulfillment(self):
        """One warehouse with enough stock → exactly one warehouse used."""
        order_lines = [
            OrderLine(quotation_line_id=1, product_id=101, quantity_required=10),
            OrderLine(quotation_line_id=2, product_id=102, quantity_required=5),
        ]
        stock_entries = [
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=101, quantity_available=20, shipping_cost_weight=2.0),
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=102, quantity_available=10, shipping_cost_weight=2.0),
            StockEntry(warehouse_id=2, warehouse_name="WH2", product_id=101, quantity_available=15, shipping_cost_weight=5.0),
            StockEntry(warehouse_id=2, warehouse_name="WH2", product_id=102, quantity_available=8, shipping_cost_weight=5.0),
        ]
        result = compute_suggested_split(order_lines, stock_entries)
        assert result.shipment_count == 1
        assert result.has_backorders is False
        warehouse_ids = {a.warehouse_id for a in result.allocations}
        assert warehouse_ids == {1}
        assert result.estimated_cost == 2.0

    def test_forced_multi_warehouse_split(self):
        """No single warehouse has all products → split across warehouses."""
        order_lines = [
            OrderLine(quotation_line_id=1, product_id=101, quantity_required=10),
            OrderLine(quotation_line_id=2, product_id=102, quantity_required=10),
        ]
        stock_entries = [
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=101, quantity_available=10, shipping_cost_weight=1.0),
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=102, quantity_available=3, shipping_cost_weight=1.0),
            StockEntry(warehouse_id=2, warehouse_name="WH2", product_id=101, quantity_available=5, shipping_cost_weight=3.0),
            StockEntry(warehouse_id=2, warehouse_name="WH2", product_id=102, quantity_available=10, shipping_cost_weight=3.0),
        ]
        result = compute_suggested_split(order_lines, stock_entries)
        assert result.shipment_count == 2
        assert result.has_backorders is False

        line1_fulfilled = sum(a.quantity_fulfilled for a in result.allocations if a.quotation_line_id == 1)
        line2_fulfilled = sum(a.quantity_fulfilled for a in result.allocations if a.quotation_line_id == 2)
        assert line1_fulfilled == 10
        assert line2_fulfilled == 10

    def test_backorder_when_insufficient_stock(self):
        """When total stock < required → partial fulfillment + backorder."""
        order_lines = [
            OrderLine(quotation_line_id=1, product_id=101, quantity_required=100),
        ]
        stock_entries = [
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=101, quantity_available=30, shipping_cost_weight=1.0),
            StockEntry(warehouse_id=2, warehouse_name="WH2", product_id=101, quantity_available=20, shipping_cost_weight=2.0),
        ]
        result = compute_suggested_split(order_lines, stock_entries)
        assert result.has_backorders is True

        fulfilled = sum(a.quantity_fulfilled for a in result.allocations)
        backordered = sum(a.quantity_backordered for a in result.allocations)
        assert fulfilled == 50
        assert backordered == 50

    def test_zero_warehouses_all_backordered(self):
        """No warehouses → everything is backordered."""
        order_lines = [
            OrderLine(quotation_line_id=1, product_id=101, quantity_required=5),
        ]
        result = compute_suggested_split(order_lines, [])
        assert result.has_backorders is True
        assert result.shipment_count == 0
        assert result.allocations[0].quantity_backordered == 5

    def test_deterministic_line_order(self):
        """Lines processed in quotation_line_id order (ascending) for determinism.

        Two lines compete for the same scarce stock of product 101.
        Line id=1 is processed first and gets its full 8.
        Line id=2 gets the remaining 2, with 6 backordered.
        """
        order_lines = [
            OrderLine(quotation_line_id=2, product_id=101, quantity_required=8),
            OrderLine(quotation_line_id=1, product_id=101, quantity_required=8),
        ]
        stock_entries = [
            StockEntry(warehouse_id=1, warehouse_name="WH1", product_id=101, quantity_available=10, shipping_cost_weight=1.0),
        ]
        result = compute_suggested_split(order_lines, stock_entries)

        # Line 1 (id=1) processed first, gets 8. Line 2 (id=2) gets 2 + 6 backordered.
        line1_fulfilled = sum(a.quantity_fulfilled for a in result.allocations if a.quotation_line_id == 1)
        line2_fulfilled = sum(a.quantity_fulfilled for a in result.allocations if a.quotation_line_id == 2)
        line2_backordered = sum(a.quantity_backordered for a in result.allocations if a.quotation_line_id == 2)

        assert line1_fulfilled == 8
        assert line2_fulfilled == 2
        assert line2_backordered == 6


# ── Integration Tests ──────────────────────────────────────────────────────

class TestFulfillmentEndpoints:
    """Integration tests for the fulfillment API endpoints."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup(db)
        self.data = _seed_fulfillment_data(db)
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup(db)
        db.close()

    def test_suggested_split_single_warehouse(self):
        """WH1 has enough stock → split uses exactly one warehouse."""
        token = _token_for_id(self.data["admin_id"])
        resp = client.get(
            f"/api/v1/fulfillment/suggested-split?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["shipment_count"] == 1
        assert body["has_backorders"] is False

    def test_accept_split_creates_records(self):
        """Accepting a split persists the split and adjusts stock."""
        token = _token_for_id(self.data["admin_id"])
        resp = client.post(
            "/api/v1/fulfillment/accept",
            json={"quotation_id": self.data["quotation_id"]},
            headers=_auth(token),
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body["quotation_id"] == self.data["quotation_id"]
        assert body["status"] in ("accepted", "partially_fulfilled")

    def test_manual_override_rejected_when_exceeds_stock(self):
        """Override with quantity > available stock is rejected (400)."""
        token = _token_for_id(self.data["finance_id"])
        resp = client.post(
            "/api/v1/fulfillment/override",
            json={
                "quotation_id": self.data["quotation_id"],
                "lines": [
                    {
                        "quotation_line_id": self.data["ql1_id"],
                        "warehouse_id": self.data["wh2_id"],
                        "quantity": 999,
                    }
                ],
                "reason": "Testing excess",
            },
            headers=_auth(token),
        )
        assert resp.status_code == 400
        assert "exceeds available stock" in resp.json()["detail"].lower()

    def test_manual_override_by_sales_rep_rejected(self):
        """SalesRep cannot use the override endpoint (403)."""
        token = _token_for_id(self.data["rep_id"])
        resp = client.post(
            "/api/v1/fulfillment/override",
            json={
                "quotation_id": self.data["quotation_id"],
                "lines": [
                    {
                        "quotation_line_id": self.data["ql1_id"],
                        "warehouse_id": self.data["wh1_id"],
                        "quantity": 1,
                    }
                ],
            },
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_portal_token_rejected_on_suggested_split(self):
        """A portal-scoped JWT is rejected."""
        token = _portal_token()
        resp = client.get(
            f"/api/v1/fulfillment/suggested-split?quotation_id={self.data['quotation_id']}",
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_portal_token_rejected_on_accept(self):
        token = _portal_token()
        resp = client.post(
            "/api/v1/fulfillment/accept",
            json={"quotation_id": 1},
            headers=_auth(token),
        )
        assert resp.status_code == 403

    def test_portal_token_rejected_on_override(self):
        token = _portal_token()
        resp = client.post(
            "/api/v1/fulfillment/override",
            json={"quotation_id": 1, "lines": [{"quotation_line_id": 1, "warehouse_id": 1, "quantity": 1}]},
            headers=_auth(token),
        )
        assert resp.status_code == 403


class TestBackorderConsolidation:
    """Test the backorder consolidation flow."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup(db)
        self.data = _seed_fulfillment_data(db)
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup(db)
        db.close()

    def test_backorder_consolidation_flow(self):
        """Create a backorder, replenish stock, then consolidate."""
        db = SessionLocal()
        # Reduce WH1 stock so product B is partially backordered
        wh1_p2_stock = db.scalar(
            select(WarehouseStock).where(
                WarehouseStock.warehouse_id == self.data["wh1_id"],
                WarehouseStock.product_id == self.data["p2_id"],
            )
        )
        wh1_p2_stock.quantity_on_hand = 2  # Need 5, only have 2

        wh2_p2_stock = db.scalar(
            select(WarehouseStock).where(
                WarehouseStock.warehouse_id == self.data["wh2_id"],
                WarehouseStock.product_id == self.data["p2_id"],
            )
        )
        wh2_p2_stock.quantity_on_hand = 1  # total available = 3, need 5 → 2 backordered
        db.commit()
        db.close()

        # Accept the split — should create backorders
        token = _token_for_id(self.data["admin_id"])
        resp = client.post(
            "/api/v1/fulfillment/accept",
            json={"quotation_id": self.data["quotation_id"]},
            headers=_auth(token),
        )
        assert resp.status_code == 200, resp.text

        # Check backorders exist
        db = SessionLocal()
        backorders = db.scalars(select(Backorder).where(Backorder.status == BackorderStatus.OPEN)).all()
        assert len(backorders) > 0
        bo_id = backorders[0].id
        db.close()

        # Replenish stock
        resp = client.post(
            f"/api/v1/warehouses/{self.data['wh1_id']}/stock/replenish",
            json={"product_id": self.data["p2_id"], "quantity": 10},
            headers=_auth(token),
        )
        assert resp.status_code == 200

        # Run the celery task synchronously
        from app.tasks.fulfillment_tasks import check_backorder_consolidation
        check_backorder_consolidation(self.data["wh1_id"], self.data["p2_id"])

        # Backorder should now be consolidation_ready
        db = SessionLocal()
        bo = db.get(Backorder, bo_id)
        assert bo.status == BackorderStatus.CONSOLIDATION_READY
        db.close()

        # Consolidate
        resp = client.post(
            f"/api/v1/fulfillment/backorders/{bo_id}/consolidate",
            headers=_auth(token),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "consolidated"


class TestWarehouseCrud:
    """Test warehouse CRUD and stock endpoints."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup(db)
        self.data = _seed_fulfillment_data(db)
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup(db)
        db.close()

    def test_create_warehouse(self):
        token = _token_for_id(self.data["admin_id"])
        resp = client.post(
            "/api/v1/warehouses",
            json={"name": "New WH", "location": "City C", "shipping_cost_weight": 2.5},
            headers=_auth(token),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "New WH"

    def test_list_warehouses(self):
        token = _token_for_id(self.data["rep_id"])
        resp = client.get("/api/v1/warehouses", headers=_auth(token))
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_update_shipping_weight(self):
        token = _token_for_id(self.data["finance_id"])
        resp = client.patch(
            f"/api/v1/warehouses/{self.data['wh1_id']}/shipping-weight",
            json={"shipping_cost_weight": 0.5},
            headers=_auth(token),
        )
        assert resp.status_code == 200
        assert resp.json()["shipping_cost_weight"] == 0.5

    def test_create_stock(self):
        token = _token_for_id(self.data["admin_id"])
        db = SessionLocal()
        p = Product(name="FFProduct_New", category="FFCat", base_price=Decimal("50.00"), unit="each", tax_rate=Decimal("0"))
        db.add(p)
        db.commit()
        pid = p.id
        db.close()

        resp = client.post(
            f"/api/v1/warehouses/{self.data['wh1_id']}/stock",
            json={"product_id": pid, "quantity_on_hand": 100, "reserved_quantity": 0},
            headers=_auth(token),
        )
        assert resp.status_code == 201
        assert resp.json()["quantity_on_hand"] == 100

    def test_portal_token_rejected_on_warehouses(self):
        token = _portal_token()
        resp = client.get("/api/v1/warehouses", headers=_auth(token))
        assert resp.status_code == 403


class TestConcurrencySafety:
    """Test that concurrent accept calls don't oversell stock."""

    def setup_method(self):
        db = SessionLocal()
        _cleanup_concurrency_data(db)

        admin = User(email="conc_admin@test.com", full_name="Conc Admin", role=Role.ADMIN,
                     hashed_password=hash_password("TestPass1!"))
        db.add(admin)
        db.flush()

        customer = Customer(name="Conc Customer", email="conc_cust@test.com", tier=CustomerTier.BRONZE)
        db.add(customer)
        db.flush()

        p = Product(name="ConcProduct", category="ConcCat", base_price=Decimal("10.00"), unit="each", tax_rate=Decimal("0"))
        db.add(p)
        db.flush()

        wh = Warehouse(name="ConcWH", location="City", shipping_cost_weight=1.0)
        db.add(wh)
        db.flush()

        db.add(WarehouseStock(warehouse_id=wh.id, product_id=p.id, quantity_on_hand=5, reserved_quantity=0))

        q1 = Quotation(customer_id=customer.id, rep_id=admin.id, status=QuotationStatus.CONFIRMED)
        q2 = Quotation(customer_id=customer.id, rep_id=admin.id, status=QuotationStatus.CONFIRMED)
        db.add_all([q1, q2])
        db.flush()

        db.add(QuotationLine(quotation_id=q1.id, product_id=p.id, quantity=Decimal("5"),
                             unit_price=Decimal("10"), discount_percent=Decimal("0"), line_total=Decimal("50")))
        db.add(QuotationLine(quotation_id=q2.id, product_id=p.id, quantity=Decimal("5"),
                             unit_price=Decimal("10"), discount_percent=Decimal("0"), line_total=Decimal("50")))

        self.admin_id = admin.id
        self.q1_id = q1.id
        self.q2_id = q2.id
        self.wh_id = wh.id
        self.p_id = p.id

        db.commit()
        db.close()

    def teardown_method(self):
        db = SessionLocal()
        _cleanup_concurrency_data(db)
        db.close()

    def test_concurrent_accepts_dont_oversell(self):
        """Two simultaneous accepts for scarce stock: total reserved <= on_hand."""
        token = _token_for_id(self.admin_id)
        results = [None, None]

        def accept(idx, quotation_id):
            resp = client.post(
                "/api/v1/fulfillment/accept",
                json={"quotation_id": quotation_id},
                headers=_auth(token),
            )
            results[idx] = resp.status_code

        t1 = threading.Thread(target=accept, args=(0, self.q1_id))
        t2 = threading.Thread(target=accept, args=(1, self.q2_id))
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        assert 200 in results

        db = SessionLocal()
        stock = db.scalar(
            select(WarehouseStock).where(
                WarehouseStock.warehouse_id == self.wh_id,
                WarehouseStock.product_id == self.p_id,
            )
        )
        assert stock.reserved_quantity <= stock.quantity_on_hand
        db.close()
