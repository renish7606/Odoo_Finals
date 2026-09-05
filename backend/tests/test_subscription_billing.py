"""
Comprehensive unit tests for Phase 8: Subscription & Hybrid Billing.

Covers:
  - Mixed one-time + recurring order totals calculation
  - Billing schedule generation (monthly, quarterly, yearly cadences)
  - Mid-cycle upgrade proration math and invoice creation
  - Mid-cycle downgrade proration math and credit note creation
  - Cancellation refunds: full / partial / none
  - Payment recording (partial, full, overpayment)
  - Full API endpoint smoke tests via FastAPI TestClient
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# Import Base from app.db.base which registers ALL models
import app.db.base  # noqa: F401 – side-effect: registers all models with Base.metadata
from app.db.base_class import Base
from app.db.session import get_db
from app.main import app
from app.models.customer import Customer, CustomerTier
from app.models.invoice import Invoice, InvoiceStatus, Payment
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.subscription import (
    BillingSchedule,
    CancellationRule,
    ProrationRule,
    RefundType,
    ScheduleStatus,
    SubscriptionCadence,
    SubscriptionPlan,
)
from app.models.user import User
from app.services import billing_service, proration_service, refund_service
from app.core.security import hash_password

# ─────────────────────────────────────────────────────────────────────────────
# Test database setup (in-memory SQLite, one per test function)
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy.pool import StaticPool

TEST_DB_URL = "sqlite://"

@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Each test gets a fresh in-memory DB with all tables created."""
    engine = create_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """FastAPI test client with the DB dependency overridden to use test session."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ─────────────────────────────────────────────────────────────────────────────
# Fixture helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_product(db: Session, name: str = "Widget", price: str = "100.00") -> Product:
    p = Product(name=name, category="Test", base_price=Decimal(price), unit="unit", tax_rate=Decimal("0"))
    db.add(p)
    db.flush()
    return p


def make_plan(
    db: Session,
    product: Product,
    cadence: SubscriptionCadence = SubscriptionCadence.MONTHLY,
    price: str = "200.00",
    name: str = "Monthly Plan",
) -> SubscriptionPlan:
    plan = SubscriptionPlan(name=name, cadence=cadence, product_id=product.id, price=Decimal(price))
    db.add(plan)
    db.flush()
    return plan


def make_customer(db: Session, email: str = "corp@test.com") -> Customer:
    c = Customer(name="Test Corp", email=email, tier=CustomerTier.GOLD)
    db.add(c)
    db.flush()
    return c


def make_user(db: Session, email: str = "rep@test.com", role: Role = Role.SALES_REP) -> User:
    u = User(
        email=email,
        full_name="Test User",
        role=role,
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )
    db.add(u)
    db.flush()
    return u


def make_quotation(db: Session, customer: Customer, user: User) -> Quotation:
    q = Quotation(customer_id=customer.id, rep_id=user.id, status=QuotationStatus.CONFIRMED)
    db.add(q)
    db.flush()
    return q


def make_one_time_line(
    db: Session, quotation: Quotation, product: Product, qty: str = "1", price: str = "100.00"
) -> QuotationLine:
    line = QuotationLine(
        quotation_id=quotation.id,
        product_id=product.id,
        plan_id=None,
        quantity=Decimal(qty),
        unit_price=Decimal(price),
        discount_percent=Decimal("0"),
        line_total=Decimal(qty) * Decimal(price),
    )
    db.add(line)
    db.flush()
    return line


def make_recurring_line(
    db: Session, quotation: Quotation, product: Product, plan: SubscriptionPlan, qty: str = "1"
) -> QuotationLine:
    cycle_amount = plan.price * Decimal(qty)
    line = QuotationLine(
        quotation_id=quotation.id,
        product_id=product.id,
        plan_id=plan.id,
        quantity=Decimal(qty),
        unit_price=plan.price,
        discount_percent=Decimal("0"),
        line_total=cycle_amount,
    )
    db.add(line)
    db.flush()
    return line


def make_invoice(db: Session, quotation: Quotation, amount: str = "300.00") -> Invoice:
    inv = Invoice(
        quotation_id=quotation.id,
        amount=Decimal(amount),
        status=InvoiceStatus.UNPAID,
    )
    db.add(inv)
    db.flush()
    return inv


def add_billing_schedule(
    db: Session,
    line: QuotationLine,
    plan: SubscriptionPlan,
    billing_date: date,
    amount: str = "200.00",
    status: ScheduleStatus = ScheduleStatus.SCHEDULED,
) -> BillingSchedule:
    sched = BillingSchedule(
        quotation_line_id=line.id,
        plan_id=plan.id,
        billing_date=billing_date,
        amount=Decimal(amount),
        status=status,
    )
    db.add(sched)
    db.flush()
    return sched


# ─────────────────────────────────────────────────────────────────────────────
# 1. Order totals: mixed one-time + recurring
# ─────────────────────────────────────────────────────────────────────────────

class TestCalculateOrderTotals:
    def test_one_time_only(self, db: Session):
        product = make_product(db, price="500.00")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_one_time_line(db, quotation, product, qty="2", price="500.00")
        db.commit()
        db.refresh(quotation)

        totals = billing_service.calculate_order_totals(quotation)

        assert totals["one_time_total"] == Decimal("1000.00")
        assert totals["recurring_monthly_equivalent"] == Decimal("0")
        assert totals["grand_total_immediate"] == Decimal("1000.00")

    def test_recurring_only_monthly(self, db: Session):
        product = make_product(db, price="300.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.MONTHLY, price="300.00")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan, qty="2")
        db.commit()
        db.refresh(quotation)

        totals = billing_service.calculate_order_totals(quotation)

        assert totals["one_time_total"] == Decimal("0")
        assert totals["recurring_subtotals_by_cadence"]["monthly"] == Decimal("600.00")
        assert totals["recurring_monthly_equivalent"] == Decimal("600.00")
        assert totals["grand_total_immediate"] == Decimal("600.00")

    def test_mixed_one_time_and_recurring(self, db: Session):
        product_ot = make_product(db, name="Setup Fee", price="250.00")
        product_rec = make_product(db, name="SaaS", price="100.00")
        plan = make_plan(db, product_rec, cadence=SubscriptionCadence.MONTHLY, price="100.00", name="SaaS Plan")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_one_time_line(db, quotation, product_ot, qty="1", price="250.00")
        make_recurring_line(db, quotation, product_rec, plan, qty="3")
        db.commit()
        db.refresh(quotation)

        totals = billing_service.calculate_order_totals(quotation)

        assert totals["one_time_total"] == Decimal("250.00")
        assert totals["recurring_subtotals_by_cadence"]["monthly"] == Decimal("300.00")
        assert totals["grand_total_immediate"] == Decimal("550.00")

    def test_quarterly_monthly_equivalent(self, db: Session):
        product = make_product(db, price="300.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.QUARTERLY, price="300.00", name="Quarterly Plan")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan, qty="1")
        db.commit()
        db.refresh(quotation)

        totals = billing_service.calculate_order_totals(quotation)

        # 300 / 3 = 100.00 monthly equivalent
        assert totals["recurring_monthly_equivalent"] == Decimal("100.00")

    def test_yearly_monthly_equivalent(self, db: Session):
        product = make_product(db, price="1200.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.YEARLY, price="1200.00", name="Yearly Plan")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan, qty="1")
        db.commit()
        db.refresh(quotation)

        totals = billing_service.calculate_order_totals(quotation)

        # 1200 / 12 = 100.00 monthly equivalent
        assert totals["recurring_monthly_equivalent"] == Decimal("100.00")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Billing schedule generation
# ─────────────────────────────────────────────────────────────────────────────

class TestGenerateBillingSchedule:
    def test_monthly_generates_12_schedules(self, db: Session):
        product = make_product(db, price="100.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.MONTHLY, price="100.00")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan)
        db.commit()
        db.refresh(quotation)

        billing_service.generate_billing_schedule(db, quotation, start_date=date(2026, 1, 1))

        schedules = db.query(BillingSchedule).all()
        assert len(schedules) == 12
        assert schedules[0].billing_date == date(2026, 1, 1)
        assert schedules[11].billing_date == date(2026, 12, 1)

    def test_quarterly_generates_4_schedules(self, db: Session):
        product = make_product(db, price="300.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.QUARTERLY, price="300.00", name="Q Plan")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan)
        db.commit()
        db.refresh(quotation)

        billing_service.generate_billing_schedule(db, quotation, start_date=date(2026, 1, 1))

        schedules = db.query(BillingSchedule).all()
        assert len(schedules) == 4
        assert schedules[0].billing_date == date(2026, 1, 1)
        assert schedules[3].billing_date == date(2026, 10, 1)

    def test_yearly_generates_1_schedule(self, db: Session):
        product = make_product(db, price="1200.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.YEARLY, price="1200.00", name="Annual Plan")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan)
        db.commit()
        db.refresh(quotation)

        billing_service.generate_billing_schedule(db, quotation, start_date=date(2026, 1, 1))

        schedules = db.query(BillingSchedule).all()
        assert len(schedules) == 1

    def test_initial_invoice_includes_one_time_and_first_cycle(self, db: Session):
        product_ot = make_product(db, name="Onboarding", price="500.00")
        product_rec = make_product(db, name="SaaS2", price="200.00")
        plan = make_plan(db, product_rec, cadence=SubscriptionCadence.MONTHLY, price="200.00", name="Plan2")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_one_time_line(db, quotation, product_ot, qty="1", price="500.00")
        make_recurring_line(db, quotation, product_rec, plan, qty="1")
        db.commit()
        db.refresh(quotation)

        invoice = billing_service.generate_billing_schedule(db, quotation, start_date=date(2026, 1, 1))

        assert invoice.amount == Decimal("700.00")  # 500 one-time + 200 first cycle
        assert invoice.status == InvoiceStatus.UNPAID

    def test_schedule_amount_reflects_quantity(self, db: Session):
        product = make_product(db, price="100.00")
        plan = make_plan(db, product, cadence=SubscriptionCadence.MONTHLY, price="100.00")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        make_recurring_line(db, quotation, product, plan, qty="5")
        db.commit()
        db.refresh(quotation)

        billing_service.generate_billing_schedule(db, quotation, start_date=date(2026, 1, 1))

        schedules = db.query(BillingSchedule).all()
        assert all(s.amount == Decimal("500.00") for s in schedules)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Proration math
# ─────────────────────────────────────────────────────────────────────────────

class TestProrationService:
    def _setup(
        self,
        db: Session,
        plan_price: str = "100.00",
        cadence: SubscriptionCadence = SubscriptionCadence.MONTHLY,
        billing_date: date = date(2026, 1, 1),
        product_name: str = "Sub Product",
    ):
        product = make_product(db, name=product_name, price=plan_price)
        plan = make_plan(db, product, cadence=cadence, price=plan_price, name=f"Plan-{product_name}")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        line = make_recurring_line(db, quotation, product, plan, qty="1")
        add_billing_schedule(db, line, plan, billing_date=billing_date, amount=plan_price)
        inv = make_invoice(db, quotation, amount=plan_price)
        db.commit()
        return product, plan, customer, user, quotation, line

    def test_upgrade_proration_is_positive_debit(self, db: Session):
        """Upgrading from $100 to $200/month mid-cycle should produce a debit."""
        product, old_plan, customer, user, quotation, line = self._setup(db, plan_price="100.00")
        new_product = make_product(db, name="Premium", price="200.00")
        new_plan = make_plan(db, new_product, price="200.00", name="Premium Plan")
        db.commit()

        # Jan 15: 16 days remaining of 30-day cycle
        preview = proration_service.compute_proration(
            db, line, new_plan_id=new_plan.id, new_quantity=None, change_date=date(2026, 1, 15)
        )

        assert preview["direction"] == "debit"
        assert preview["proration_amount"] > 0
        # (16/30) * (200 - 100) = 53.33
        expected = (Decimal("16") / Decimal("30") * Decimal("100")).quantize(Decimal("0.01"))
        assert abs(preview["proration_amount"] - expected) <= Decimal("0.02")

    def test_downgrade_proration_is_credit(self, db: Session):
        """Downgrading from $200 to $100/month mid-cycle should produce a credit."""
        product, old_plan, customer, user, quotation, line = self._setup(db, plan_price="200.00", product_name="Exp Prod")
        new_product = make_product(db, name="Basic", price="100.00")
        new_plan = make_plan(db, new_product, price="100.00", name="Basic Plan")
        db.commit()

        preview = proration_service.compute_proration(
            db, line, new_plan_id=new_plan.id, new_quantity=None, change_date=date(2026, 1, 15)
        )

        assert preview["direction"] == "credit"
        assert preview["proration_amount"] > 0

    def test_quantity_increase_produces_debit(self, db: Session):
        """Increasing qty from 1 to 3 at same plan should produce a debit."""
        product, plan, customer, user, quotation, line = self._setup(db, plan_price="100.00", product_name="QtyProd")
        db.commit()

        preview = proration_service.compute_proration(
            db, line, new_plan_id=None, new_quantity=Decimal("3"), change_date=date(2026, 1, 10)
        )

        assert preview["direction"] == "debit"
        assert preview["old_cycle_amount"] == Decimal("100.00")
        assert preview["new_cycle_amount"] == Decimal("300.00")

    def test_proration_zero_when_no_change(self, db: Session):
        """No plan/qty change → proration amount is 0."""
        product, plan, customer, user, quotation, line = self._setup(db, product_name="ZeroChangeProd")
        db.commit()

        preview = proration_service.compute_proration(
            db, line, new_plan_id=None, new_quantity=None, change_date=date(2026, 1, 15)
        )

        assert preview["proration_amount"] == Decimal("0")

    def test_apply_proration_creates_debit_invoice(self, db: Session):
        """Upgrade: apply_proration should create a new Invoice."""
        product, old_plan, customer, user, quotation, line = self._setup(db, plan_price="100.00", product_name="Upg1")
        new_product = make_product(db, name="Pro", price="300.00")
        new_plan = make_plan(db, new_product, price="300.00", name="Pro Plan")
        db.commit()

        result = proration_service.apply_proration(
            db, line, new_plan_id=new_plan.id, new_quantity=None, change_date=date(2026, 1, 15)
        )

        assert result["invoice_id"] is not None
        assert result["credit_note_id"] is None
        inv = db.get(Invoice, result["invoice_id"])
        assert inv is not None
        assert inv.amount > 0

    def test_apply_proration_creates_credit_note_on_downgrade(self, db: Session):
        """Downgrade: apply_proration should create a CreditNote."""
        product, old_plan, customer, user, quotation, line = self._setup(db, plan_price="300.00", product_name="Dng1")
        new_product = make_product(db, name="Starter", price="100.00")
        new_plan = make_plan(db, new_product, price="100.00", name="Starter Plan")
        db.commit()

        result = proration_service.apply_proration(
            db, line, new_plan_id=new_plan.id, new_quantity=None, change_date=date(2026, 1, 15)
        )

        assert result["credit_note_id"] is not None
        assert result["invoice_id"] is None

    def test_apply_proration_updates_future_schedules(self, db: Session):
        """After modification, future BillingSchedule rows reflect the new price."""
        product, old_plan, customer, user, quotation, line = self._setup(db, plan_price="100.00", product_name="FutureSched")
        add_billing_schedule(db, line, old_plan, billing_date=date(2026, 2, 1), amount="100.00")
        add_billing_schedule(db, line, old_plan, billing_date=date(2026, 3, 1), amount="100.00")
        new_product = make_product(db, name="New Prod", price="200.00")
        new_plan = make_plan(db, new_product, price="200.00", name="New Plan")
        db.commit()

        proration_service.apply_proration(
            db, line, new_plan_id=new_plan.id, new_quantity=None, change_date=date(2026, 1, 15)
        )

        future = db.query(BillingSchedule).filter(
            BillingSchedule.billing_date > date(2026, 1, 15)
        ).all()
        assert all(s.amount == Decimal("200.00") for s in future)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Cancellation refund math
# ─────────────────────────────────────────────────────────────────────────────

class TestRefundService:
    def _setup(self, db: Session, price: str = "300.00", product_name: str = "RefundProd"):
        product = make_product(db, name=product_name, price=price)
        plan = make_plan(db, product, price=price, cadence=SubscriptionCadence.MONTHLY, name=f"Plan-{product_name}")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        line = make_recurring_line(db, quotation, product, plan, qty="1")
        add_billing_schedule(db, line, plan, billing_date=date(2026, 1, 1), amount=price)
        add_billing_schedule(db, line, plan, billing_date=date(2026, 2, 1), amount=price)
        add_billing_schedule(db, line, plan, billing_date=date(2026, 3, 1), amount=price)
        inv = make_invoice(db, quotation, amount=price)
        db.commit()
        return product, plan, customer, user, quotation, line

    def test_full_refund_returns_full_cycle_amount(self, db: Session):
        product, plan, customer, user, quotation, line = self._setup(db, price="300.00")
        rule = CancellationRule(plan_id=plan.id, refund_type=RefundType.FULL)
        db.add(rule)
        db.commit()

        result = refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))

        assert result["refund_amount"] == Decimal("300.00")
        assert result["credit_note_id"] is not None

    def test_partial_refund_uses_days_remaining_ratio(self, db: Session):
        product, plan, customer, user, quotation, line = self._setup(db, price="300.00", product_name="PartialProd")
        rule = CancellationRule(plan_id=plan.id, refund_type=RefundType.PARTIAL)
        db.add(rule)
        db.commit()

        # Jan 1 → Jan 15 = 14 days elapsed, 16 days remaining of 30
        result = refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))

        # Expected: (16/30) * 300 = 160.00
        expected = (Decimal("16") / Decimal("30") * Decimal("300")).quantize(Decimal("0.01"))
        assert abs(result["refund_amount"] - expected) <= Decimal("0.02")
        assert result["credit_note_id"] is not None

    def test_none_refund_produces_zero_and_no_credit_note(self, db: Session):
        product, plan, customer, user, quotation, line = self._setup(db, product_name="NoneProd")
        rule = CancellationRule(plan_id=plan.id, refund_type=RefundType.NONE)
        db.add(rule)
        db.commit()

        result = refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))

        assert result["refund_amount"] == Decimal("0")
        assert result["credit_note_id"] is None

    def test_cancellation_marks_future_schedules_failed(self, db: Session):
        product, plan, customer, user, quotation, line = self._setup(db, product_name="FutureFailProd")
        db.commit()

        result = refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))

        # Feb and Mar schedules should be cancelled
        assert result["cancelled_schedules"] == 2
        failed = db.query(BillingSchedule).filter(BillingSchedule.status == ScheduleStatus.FAILED).all()
        assert len(failed) == 2

    def test_cancellation_without_rule_produces_zero_refund(self, db: Session):
        product, plan, customer, user, quotation, line = self._setup(db, product_name="NoRuleProd")
        db.commit()

        result = refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))

        assert result["refund_amount"] == Decimal("0")
        assert result["credit_note_id"] is None

    def test_cancelling_non_recurring_line_raises(self, db: Session):
        product = make_product(db, name="OneTimeProd", price="100.00")
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        line = make_one_time_line(db, quotation, product)
        db.commit()

        with pytest.raises(ValueError, match="not a recurring line"):
            refund_service.cancel_subscription_line(db, line, cancellation_date=date(2026, 1, 15))


# ─────────────────────────────────────────────────────────────────────────────
# 5. Payment recording
# ─────────────────────────────────────────────────────────────────────────────

class TestPaymentRecording:
    def test_partial_payment_sets_partially_paid(self, db: Session):
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        inv = make_invoice(db, quotation, amount="500.00")
        db.commit()

        billing_service.record_payment(db, inv, Decimal("200.00"))

        fresh = db.get(Invoice, inv.id)
        assert fresh.status == InvoiceStatus.PARTIALLY_PAID

    def test_full_payment_sets_paid(self, db: Session):
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        inv = make_invoice(db, quotation, amount="500.00")
        db.commit()

        billing_service.record_payment(db, inv, Decimal("500.00"))

        fresh = db.get(Invoice, inv.id)
        assert fresh.status == InvoiceStatus.PAID

    def test_overpayment_raises_value_error(self, db: Session):
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        inv = make_invoice(db, quotation, amount="100.00")
        db.commit()

        with pytest.raises(ValueError, match="exceeds remaining balance"):
            billing_service.record_payment(db, inv, Decimal("200.00"))

    def test_multiple_payments_accumulate(self, db: Session):
        customer = make_customer(db)
        user = make_user(db)
        quotation = make_quotation(db, customer, user)
        inv = make_invoice(db, quotation, amount="500.00")
        db.commit()

        billing_service.record_payment(db, inv, Decimal("200.00"))
        billing_service.record_payment(db, inv, Decimal("300.00"))

        fresh = db.get(Invoice, inv.id)
        assert fresh.status == InvoiceStatus.PAID
        payments = db.query(Payment).filter(Payment.invoice_id == inv.id).all()
        assert len(payments) == 2


# ─────────────────────────────────────────────────────────────────────────────
# 6. API endpoint smoke tests
# ─────────────────────────────────────────────────────────────────────────────

class TestSubscriptionEndpoints:
    def _make_admin_and_token(self, client: TestClient, db: Session) -> tuple[User, str]:
        admin = make_user(db, email="admin@test.com", role=Role.ADMIN)
        db.commit()
        resp = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "TestPass123!"})
        assert resp.status_code == 200, resp.text
        return admin, resp.json()["access_token"]

    def _headers(self, token: str) -> dict:
        return {"Authorization": f"Bearer {token}"}

    def test_create_and_list_plans(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        product = make_product(db, name="EP Product", price="99.00")
        db.commit()

        resp = client.post(
            "/api/v1/subscriptions/plans",
            json={"name": "Basic", "cadence": "monthly", "product_id": product.id, "price": "99.00"},
            headers=self._headers(token),
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Basic"

        resp2 = client.get("/api/v1/subscriptions/plans", headers=self._headers(token))
        assert resp2.status_code == 200
        assert any(p["name"] == "Basic" for p in resp2.json())

    def test_create_cancellation_rule(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        product = make_product(db, name="CR Product", price="150.00")
        plan = make_plan(db, product, price="150.00", name="CR Plan")
        db.commit()

        resp = client.post(
            "/api/v1/subscriptions/cancellation-rules",
            json={"plan_id": plan.id, "refund_type": "partial"},
            headers=self._headers(token),
        )
        assert resp.status_code == 201
        assert resp.json()["refund_type"] == "partial"

    def test_create_proration_rule(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        product = make_product(db, name="PR Product", price="150.00")
        plan = make_plan(db, product, price="150.00", name="PR Plan")
        db.commit()

        resp = client.post(
            "/api/v1/subscriptions/proration-rules",
            json={"plan_id": plan.id, "rule_type": "days_remaining_ratio"},
            headers=self._headers(token),
        )
        assert resp.status_code == 201

    def test_generate_schedule_and_get_schedules(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        product = make_product(db, name="Sched Product", price="100.00")
        plan = make_plan(db, product, price="100.00", name="Sched Plan")
        customer = make_customer(db)
        quotation = make_quotation(db, customer, admin)
        make_recurring_line(db, quotation, product, plan)
        db.commit()

        gen_resp = client.post(
            f"/api/v1/billing/quotations/{quotation.id}/generate-schedule",
            headers=self._headers(token),
        )
        assert gen_resp.status_code == 201

        sched_resp = client.get(
            f"/api/v1/billing/quotations/{quotation.id}/schedules",
            headers=self._headers(token),
        )
        assert sched_resp.status_code == 200
        assert len(sched_resp.json()) == 12  # monthly → 12 schedules

    def test_record_payment_endpoint(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        customer = make_customer(db)
        quotation = make_quotation(db, customer, admin)
        inv = make_invoice(db, quotation, amount="500.00")
        db.commit()

        resp = client.post(
            f"/api/v1/billing/invoices/{inv.id}/payments",
            json={"amount": "300.00", "reference": "TXN-001"},
            headers=self._headers(token),
        )
        assert resp.status_code == 201
        assert Decimal(resp.json()["amount"]) == Decimal("300.00")

    def test_get_invoice_detail(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        customer = make_customer(db)
        quotation = make_quotation(db, customer, admin)
        inv = make_invoice(db, quotation, amount="200.00")
        db.commit()

        resp = client.get(f"/api/v1/billing/invoices/{inv.id}", headers=self._headers(token))
        assert resp.status_code == 200
        data = resp.json()
        assert Decimal(data["amount"]) == Decimal("200.00")
        assert "payments" in data
        assert "credit_notes" in data

    def test_get_order_totals_endpoint(self, client: TestClient, db: Session):
        admin, token = self._make_admin_and_token(client, db)
        product = make_product(db, name="Tot Product", price="150.00")
        plan = make_plan(db, product, price="150.00", name="Tot Plan")
        customer = make_customer(db)
        quotation = make_quotation(db, customer, admin)
        make_recurring_line(db, quotation, product, plan, qty="2")
        db.commit()

        resp = client.get(
            f"/api/v1/billing/quotations/{quotation.id}/totals",
            headers=self._headers(token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "one_time_total" in data
        assert "recurring_monthly_equivalent" in data
        assert "grand_total_immediate" in data
        assert Decimal(data["grand_total_immediate"]) == Decimal("300.00")  # 150 * 2
