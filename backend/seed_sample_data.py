"""Seed comprehensive sample data for testing all features."""
import os, sys
os.environ['SECRET_KEY'] = 'testsecret'
os.environ['DATABASE_URL'] = 'sqlite:///dealflow.db'

from datetime import datetime, timezone, timedelta
from decimal import Decimal

from app.db.session import SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep, AuditLogEntry
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalChainConfig, ApprovalLevel
from app.models.role import Role
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

now = datetime.now(timezone.utc)

# ---- USERS ----
existing_users = {u.email: u for u in db.query(User).all()}

users_data = [
    ("admin@dealflow.com", "Admin User", Role.ADMIN),
    ("j.rao@dealflow.com", "J. Rao", Role.SALES_REP),
    ("m.shah@dealflow.com", "M. Shah", Role.SALES_MANAGER),
    ("r.iyer@dealflow.com", "R. Iyer", Role.FINANCE_OPS),
    ("s.patel@dealflow.com", "S. Patel", Role.SALES_REP),
]

users = {}
for email, name, role in users_data:
    if email in existing_users:
        users[email] = existing_users[email]
    else:
        u = User(email=email, full_name=name, role=role, hashed_password=pwd.hash("password123"))
        db.add(u)
        db.flush()
        users[email] = u

db.commit()
print(f"Users: {len(users)}")

# ---- CUSTOMERS ----
existing_customers = {c.name: c for c in db.query(Customer).all()}

from app.models.customer import CustomerTier
customers_data = [
    ("Acme Corp", "acme@example.com", CustomerTier.GOLD),
    ("Bela Industries", "bela@example.com", CustomerTier.SILVER),
    ("Nova Retail", "nova@example.com", CustomerTier.BRONZE),
    ("TechVault Inc", "techvault@example.com", CustomerTier.GOLD),
    ("GreenLeaf Solutions", "greenleaf@example.com", CustomerTier.SILVER),
]

customers = {}
for name, email, tier in customers_data:
    if name in existing_customers:
        customers[name] = existing_customers[name]
    else:
        c = Customer(name=name, email=email, tier=tier)
        db.add(c)
        db.flush()
        customers[name] = c

db.commit()
print(f"Customers: {len(customers)}")

# ---- PRODUCTS ----
existing_products = {p.name: p for p in db.query(Product).all()}

products_data = [
    ("Laptop (Hardware)", "Hardware", Decimal("1200.00")),
    ("Setup Service (Services)", "Services", Decimal("500.00")),
    ("Care Plan 2yr", "Services", Decimal("300.00")),
    ("Server Rack", "Hardware", Decimal("4500.00")),
    ("Cloud License", "Software", Decimal("800.00")),
]

products = {}
for name, category, price in products_data:
    if name in existing_products:
        products[name] = existing_products[name]
    else:
        p = Product(name=name, category=category, base_price=price, unit="each")
        db.add(p)
        db.flush()
        products[name] = p

db.commit()
print(f"Products: {len(products)}")

# ---- DISCOUNT TIERS ----
db.query(DiscountTier).delete()
db.query(CategoryDiscountCeiling).delete()
db.query(ApprovalChainConfig).delete()
db.commit()

for tier_name, max_disc in [("Bronze", 5), ("Silver", 10), ("Gold", 15)]:
    db.add(DiscountTier(customer_tier=tier_name, max_discount_percent=Decimal(str(max_disc))))
for cat, max_disc in [("Hardware", 15), ("Services", 10), ("Software", 12)]:
    db.add(CategoryDiscountCeiling(category=cat, max_discount_percent=Decimal(str(max_disc))))
db.add(ApprovalChainConfig(min_score=Decimal("1.0"), required_level=ApprovalLevel.MANAGER_ONLY))
db.add(ApprovalChainConfig(min_score=Decimal("5.0"), required_level=ApprovalLevel.MANAGER_THEN_FINANCE))
db.commit()
print("Discount rules seeded")

# ---- QUOTATIONS with lines ----
# Clear old approval data first
db.query(AuditLogEntry).delete()
db.query(ApprovalStep).delete()
db.query(ApprovalRequest).delete()
db.commit()

rep1 = users["j.rao@dealflow.com"]
rep2 = users["s.patel@dealflow.com"]
manager = users["m.shah@dealflow.com"]
finance = users["r.iyer@dealflow.com"]

# Q1: Acme Corp - HIGH risk (big discount overage) - Pending at Sales Manager
q1 = Quotation(customer_id=customers["Acme Corp"].id, rep_id=rep1.id, status=QuotationStatus.PENDING_APPROVAL,
               created_at=now - timedelta(days=3))
db.add(q1)
db.flush()

db.add(QuotationLine(quotation_id=q1.id, product_id=products["Laptop (Hardware)"].id, quantity=10,
                      unit_price=Decimal("1200"), discount_percent=Decimal("12"), line_total=Decimal("10560"),
                      category_snapshot="Hardware"))
db.add(QuotationLine(quotation_id=q1.id, product_id=products["Setup Service (Services)"].id, quantity=5,
                      unit_price=Decimal("500"), discount_percent=Decimal("18"), line_total=Decimal("2050"),
                      category_snapshot="Services"))
db.flush()

ar1 = ApprovalRequest(quotation_id=q1.id, current_step=1, status=ApprovalStatus.PENDING_MANAGER,
                       blended_risk_score=Decimal("8.5"), created_at=now - timedelta(days=3))
db.add(ar1)
db.flush()
db.add(ApprovalStep(approval_request_id=ar1.id, step_number=1, approver_role=Role.SALES_MANAGER))
db.add(ApprovalStep(approval_request_id=ar1.id, step_number=2, approver_role=Role.FINANCE_OPS))

# Audit trail for Q1
db.add(AuditLogEntry(user_id=rep1.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar1.id, reason="Initial 12% discount", timestamp=now - timedelta(days=3)))
db.add(AuditLogEntry(user_id=manager.id, action="Returned", entity_type="approval_request",
                      entity_id=ar1.id, reason="Requested justification", timestamp=now - timedelta(days=2)))
db.add(AuditLogEntry(user_id=rep1.id, action="Resubmitted", entity_type="approval_request",
                      entity_id=ar1.id, reason="Added margin note", timestamp=now - timedelta(days=1)))

# Q2: Bela Industries - MEDIUM risk - Pending at Finance
q2 = Quotation(customer_id=customers["Bela Industries"].id, rep_id=rep2.id, status=QuotationStatus.PENDING_APPROVAL,
               created_at=now - timedelta(days=5))
db.add(q2)
db.flush()

db.add(QuotationLine(quotation_id=q2.id, product_id=products["Server Rack"].id, quantity=2,
                      unit_price=Decimal("4500"), discount_percent=Decimal("14"), line_total=Decimal("7740"),
                      category_snapshot="Hardware"))
db.add(QuotationLine(quotation_id=q2.id, product_id=products["Cloud License"].id, quantity=20,
                      unit_price=Decimal("800"), discount_percent=Decimal("13"), line_total=Decimal("13920"),
                      category_snapshot="Software"))
db.flush()

ar2 = ApprovalRequest(quotation_id=q2.id, current_step=2, status=ApprovalStatus.PENDING_FINANCE,
                       blended_risk_score=Decimal("3.2"), created_at=now - timedelta(days=5))
db.add(ar2)
db.flush()
s2_1 = ApprovalStep(approval_request_id=ar2.id, step_number=1, approver_role=Role.SALES_MANAGER,
                     decision="APPROVED", decided_by=manager.id, decided_at=now - timedelta(days=4), reason="Looks good")
s2_2 = ApprovalStep(approval_request_id=ar2.id, step_number=2, approver_role=Role.FINANCE_OPS)
db.add(s2_1)
db.add(s2_2)

db.add(AuditLogEntry(user_id=rep2.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar2.id, reason="Bulk server order", timestamp=now - timedelta(days=5)))
db.add(AuditLogEntry(user_id=manager.id, action="APPROVE", entity_type="approval_request",
                      entity_id=ar2.id, reason="Looks good", timestamp=now - timedelta(days=4)))

# Q3: Nova Retail - LOW risk - Auto-Approved
q3 = Quotation(customer_id=customers["Nova Retail"].id, rep_id=rep1.id, status=QuotationStatus.APPROVED,
               created_at=now - timedelta(days=10))
db.add(q3)
db.flush()

db.add(QuotationLine(quotation_id=q3.id, product_id=products["Care Plan 2yr"].id, quantity=50,
                      unit_price=Decimal("300"), discount_percent=Decimal("3"), line_total=Decimal("14550"),
                      category_snapshot="Services"))
db.flush()

ar3 = ApprovalRequest(quotation_id=q3.id, current_step=1, status=ApprovalStatus.APPROVED,
                       blended_risk_score=Decimal("0"), created_at=now - timedelta(days=10))
db.add(ar3)
db.flush()

# Q4: TechVault - RETURNED
q4 = Quotation(customer_id=customers["TechVault Inc"].id, rep_id=rep2.id, status=QuotationStatus.DRAFT,
               created_at=now - timedelta(days=7))
db.add(q4)
db.flush()

db.add(QuotationLine(quotation_id=q4.id, product_id=products["Cloud License"].id, quantity=100,
                      unit_price=Decimal("800"), discount_percent=Decimal("20"), line_total=Decimal("64000"),
                      category_snapshot="Software"))
db.flush()

ar4 = ApprovalRequest(quotation_id=q4.id, current_step=1, status=ApprovalStatus.RETURNED,
                       blended_risk_score=Decimal("8.0"), created_at=now - timedelta(days=7))
db.add(ar4)
db.flush()
db.add(ApprovalStep(approval_request_id=ar4.id, step_number=1, approver_role=Role.SALES_MANAGER,
                     decision="RETURNED", decided_by=manager.id, decided_at=now - timedelta(days=6), reason="Discount too high"))

db.add(AuditLogEntry(user_id=rep2.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar4.id, reason="Enterprise volume deal", timestamp=now - timedelta(days=7)))
db.add(AuditLogEntry(user_id=manager.id, action="RETURN", entity_type="approval_request",
                      entity_id=ar4.id, reason="Discount too high", timestamp=now - timedelta(days=6)))

# Q5: GreenLeaf - Fully Approved with full audit trail
q5 = Quotation(customer_id=customers["GreenLeaf Solutions"].id, rep_id=rep1.id, status=QuotationStatus.CONFIRMED,
               created_at=now - timedelta(days=14))
db.add(q5)
db.flush()

db.add(QuotationLine(quotation_id=q5.id, product_id=products["Laptop (Hardware)"].id, quantity=25,
                      unit_price=Decimal("1200"), discount_percent=Decimal("11"), line_total=Decimal("26700"),
                      category_snapshot="Hardware"))
db.add(QuotationLine(quotation_id=q5.id, product_id=products["Care Plan 2yr"].id, quantity=25,
                      unit_price=Decimal("300"), discount_percent=Decimal("9"), line_total=Decimal("6825"),
                      category_snapshot="Services"))
db.flush()

ar5 = ApprovalRequest(quotation_id=q5.id, current_step=2, status=ApprovalStatus.APPROVED,
                       blended_risk_score=Decimal("2.0"), created_at=now - timedelta(days=14))
db.add(ar5)
db.flush()
db.add(ApprovalStep(approval_request_id=ar5.id, step_number=1, approver_role=Role.SALES_MANAGER,
                     decision="APPROVED", decided_by=manager.id, decided_at=now - timedelta(days=13), reason="Good margin"))
db.add(ApprovalStep(approval_request_id=ar5.id, step_number=2, approver_role=Role.FINANCE_OPS,
                     decision="APPROVED", decided_by=finance.id, decided_at=now - timedelta(days=12), reason="Revenue target met"))

db.add(AuditLogEntry(user_id=rep1.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar5.id, reason="Quarterly hardware refresh", timestamp=now - timedelta(days=14)))
db.add(AuditLogEntry(user_id=manager.id, action="APPROVE", entity_type="approval_request",
                      entity_id=ar5.id, reason="Good margin", timestamp=now - timedelta(days=13)))
db.add(AuditLogEntry(user_id=finance.id, action="APPROVE", entity_type="approval_request",
                      entity_id=ar5.id, reason="Revenue target met", timestamp=now - timedelta(days=12)))

db.commit()
print("All sample data seeded successfully!")
print(f"  Quotations: 5")
print(f"  Approval Requests: 5 (2 Pending, 1 Returned, 2 Approved)")
print(f"  Audit Trail Entries: 8")
