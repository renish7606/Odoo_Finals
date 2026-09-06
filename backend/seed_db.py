"""Create all database tables and seed mock users, products, and quotations for login testing."""

import sys
import os
from decimal import Decimal

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base_class import Base
from app.db.session import engine, SessionLocal

# Import ALL models so SQLAlchemy registers them before create_all
from app.models import *  # noqa: F401,F403
from app.models.approval import ApprovalRequest, ApprovalStep, AuditLogEntry  # noqa: F401
from app.models.deal_health import StalledDealFlag, DiscountAnomalyFlag  # noqa: F401
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalChainConfig  # noqa: F401
from app.models.fulfillment import FulfillmentSplit  # noqa: F401
from app.models.negotiation import NegotiationThread, NegotiationMessage  # noqa: F401
from app.models.portal import PortalAccess  # noqa: F401
from app.models.pricing import PriceList  # noqa: F401
from app.models.upsell import ProductPairingRule  # noqa: F401
from app.models.warehouse import Warehouse  # noqa: F401
from app.models.warehouse_stock import WarehouseStock  # noqa: F401

from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User
from app.models.customer import Customer, CustomerTier
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock


def seed():
    # Drop existing tables to recreate clean database
    print("Dropping all existing database tables...")
    Base.metadata.drop_all(bind=engine)
    print("All existing tables dropped successfully!\n")

    # Create all tables
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!\n")

    db = SessionLocal()
    try:
        # Default password for all mock users
        default_pw = hash_password("ChangeMe123!")

        # Create mock users - one per role
        admin_user = User(
            email="admin@dealflow360.com",
            full_name="Admin User",
            role=Role.ADMIN,
            hashed_password=default_pw,
            is_active=True,
        )
        salesrep_user = User(
            email="salesrep@dealflow360.com",
            full_name="Alice Johnson",
            role=Role.SALES_REP,
            hashed_password=default_pw,
            is_active=True,
        )
        manager_user = User(
            email="manager@dealflow360.com",
            full_name="Bob Williams",
            role=Role.SALES_MANAGER,
            hashed_password=default_pw,
            is_active=True,
        )
        finance_user = User(
            email="finance@dealflow360.com",
            full_name="Carol Davis",
            role=Role.FINANCE_OPS,
            hashed_password=default_pw,
            is_active=True,
        )
        customer_user = User(
            email="customer@dealflow360.com",
            full_name="David Brown",
            role=Role.CUSTOMER,
            hashed_password=default_pw,
            is_active=True,
        )

        mock_users = [admin_user, salesrep_user, manager_user, finance_user, customer_user]
        for user in mock_users:
            db.add(user)
        db.flush()

        print("Mock users created:")
        print("-" * 60)
        print(f"  {'Email':<35} {'Role':<20} Password")
        print("-" * 60)
        for u in mock_users:
            print(f"  {u.email:<35} {u.role.value:<20} ChangeMe123!")
        print("-" * 60)

        # Create Mock Customers
        cust_acme = Customer(name="Acme Corporation", email="acme@example.com", tier=CustomerTier.GOLD)
        cust_globex = Customer(name="Globex Industries", email="globex@example.com", tier=CustomerTier.SILVER)
        cust_initech = Customer(name="Initech Solutions", email="initech@example.com", tier=CustomerTier.BRONZE)
        cust_stark = Customer(name="Stark Industries", email="stark@example.com", tier=CustomerTier.GOLD)
        cust_david = Customer(name="David Brown Enterprises", email="customer@dealflow360.com", tier=CustomerTier.GOLD)

        mock_customers = [cust_acme, cust_globex, cust_initech, cust_stark, cust_david]
        for cust in mock_customers:
            db.add(cust)
        db.flush()

        # Create Mock Products
        p1 = Product(name="Enterprise Cloud Orchestration Node", category="Infrastructure", base_price=Decimal("120000.00"), unit="License", description="High throughput cloud node")
        p2 = Product(name="Architecture Consulting & Migration SLA", category="Services", base_price=Decimal("45000.00"), unit="Package", description="24/7 technical migration support")
        p3 = Product(name="High-Availability Gateway Cluster", category="Hardware", base_price=Decimal("85000.00"), unit="Unit", description="Dual-redundant gateway appliance")
        p4 = Product(name="CyberSecurity Audit & Compliance Pack", category="Security", base_price=Decimal("35000.00"), unit="Audit", description="SOC2 Type II compliance audit suite")
        p5 = Product(name="Global ERP Database Connector", category="Software", base_price=Decimal("25000.00"), unit="Connector", description="Multi-region real-time ERP sync connector")

        mock_products = [p1, p2, p3, p4, p5]
        for prod in mock_products:
            db.add(prod)
        db.flush()

        # Warehouse fixtures make the fulfillment split flow immediately testable.
        wh_ny = Warehouse(name="Equinix NY4 North America Hub", location="Secaucus, NJ", shipping_cost_weight=1.0)
        wh_fra = Warehouse(name="Frankfurt FRA1 European Gateway", location="Frankfurt, DE", shipping_cost_weight=1.15)
        db.add_all([wh_ny, wh_fra])
        db.flush()
        for warehouse in (wh_ny, wh_fra):
            for product in mock_products:
                db.add(WarehouseStock(
                    warehouse_id=warehouse.id,
                    product_id=product.id,
                    quantity_on_hand=500,
                    reserved_quantity=0,
                    replenishment_threshold=50,
                    replenishment_lead_time_days=7,
                ))
        db.flush()

        # Create Mock Quotations for Multiple Users
        quotations_data = [
            # Alice Johnson (SalesRep) Quotations
            {
                "rep": salesrep_user,
                "customer": cust_acme,
                "status": QuotationStatus.UNDER_NEGOTIATION,
                "items": [
                    {"product": p1, "qty": 2, "price": Decimal("120000.00"), "discount": Decimal("10.0")},
                    {"product": p2, "qty": 1, "price": Decimal("45000.00"), "discount": Decimal("0.0")},
                ]
            },
            {
                "rep": salesrep_user,
                "customer": cust_globex,
                "status": QuotationStatus.APPROVED,
                "items": [
                    {"product": p3, "qty": 1, "price": Decimal("85000.00"), "discount": Decimal("5.0")},
                    {"product": p5, "qty": 2, "price": Decimal("25000.00"), "discount": Decimal("0.0")},
                ]
            },
            {
                "rep": salesrep_user,
                "customer": cust_stark,
                "status": QuotationStatus.DRAFT,
                "items": [
                    {"product": p1, "qty": 5, "price": Decimal("120000.00"), "discount": Decimal("15.0")},
                ]
            },

            # Bob Williams (Sales Manager) Quotations
            {
                "rep": manager_user,
                "customer": cust_initech,
                "status": QuotationStatus.PENDING_APPROVAL,
                "items": [
                    {"product": p4, "qty": 2, "price": Decimal("35000.00"), "discount": Decimal("0.0")},
                    {"product": p2, "qty": 2, "price": Decimal("45000.00"), "discount": Decimal("10.0")},
                ]
            },
            {
                "rep": manager_user,
                "customer": cust_stark,
                "status": QuotationStatus.CONFIRMED,
                "items": [
                    {"product": p1, "qty": 3, "price": Decimal("120000.00"), "discount": Decimal("8.0")},
                    {"product": p3, "qty": 2, "price": Decimal("85000.00"), "discount": Decimal("5.0")},
                ]
            },

            # Carol Davis (Finance Ops) Quotations
            {
                "rep": finance_user,
                "customer": cust_globex,
                "status": QuotationStatus.FULFILLED,
                "items": [
                    {"product": p5, "qty": 4, "price": Decimal("25000.00"), "discount": Decimal("0.0")},
                ]
            },

            # Admin User Quotations
            {
                "rep": admin_user,
                "customer": cust_acme,
                "status": QuotationStatus.SENT,
                "items": [
                    {"product": p1, "qty": 1, "price": Decimal("120000.00"), "discount": Decimal("0.0")},
                    {"product": p4, "qty": 1, "price": Decimal("35000.00"), "discount": Decimal("5.0")},
                ]
            },

            # David Brown (Customer User) Quotation
            {
                "rep": salesrep_user,
                "customer": cust_david,
                "status": QuotationStatus.UNDER_NEGOTIATION,
                "items": [
                    {"product": p1, "qty": 1, "price": Decimal("120000.00"), "discount": Decimal("12.0")},
                    {"product": p2, "qty": 1, "price": Decimal("45000.00"), "discount": Decimal("0.0")},
                ]
            },
        ]

        created_quotes = 0
        for qdata in quotations_data:
            q = Quotation(
                customer_id=qdata["customer"].id,
                rep_id=qdata["rep"].id,
                status=qdata["status"],
            )
            db.add(q)
            db.flush()

            for item in qdata["items"]:
                price = item["price"]
                qty = Decimal(str(item["qty"]))
                disc = item["discount"]
                line_tot = price * qty * (Decimal("1.0") - (disc / Decimal("100.0")))

                line = QuotationLine(
                    quotation_id=q.id,
                    product_id=item["product"].id,
                    quantity=qty,
                    unit_price=price,
                    discount_percent=disc,
                    line_total=line_tot,
                    category_snapshot=item["product"].category,
                )
                db.add(line)

            created_quotes += 1

        db.commit()
        print(f"\n{created_quotes} quotations created with line items across multiple users!")
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
