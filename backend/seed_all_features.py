"""
Comprehensive seed script for ALL DealFlow360 features.
Seeds: Users, Customers, Products, Quotations (with lines), Approvals,
       Discount Rules, Invoices & Payments, Fulfillment, Warehouses & Stock,
       Subscriptions, Deal Health Flags, Upsell/Cross-Sell, and Price Lists.

Run:  cd backend && python seed_all_features.py
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure environment is configured before importing app modules
os.environ.setdefault("SECRET_KEY", "testsecret")
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres:devarsh1211@localhost:5432/dealflow")

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.db.base_class import Base

# Import ALL models so tables are registered
from app.models.user import User
from app.models.role import Role
from app.models.customer import Customer, CustomerTier
from app.models.product import Product, Variant
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep, AuditLogEntry
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalChainConfig, ApprovalLevel
from app.models.invoice import Invoice, InvoiceStatus, Payment, CreditNote
from app.models.fulfillment import FulfillmentSplit, FulfillmentSplitLine, FulfillmentStatus, Backorder, BackorderStatus
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock
from app.models.subscription import SubscriptionPlan, SubscriptionCadence, BillingSchedule, ScheduleStatus, ProrationRule, CancellationRule, RefundType
from app.models.deal_health import StalledDealFlag, DiscountAnomalyFlag
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig
from app.models.pricing import PriceList, PriceListEntry
from app.models.audit_log import AuditLog
from app.models.negotiation import *  # noqa
from app.models.portal import *  # noqa

db = SessionLocal()
now = datetime.now(timezone.utc)

print("=" * 60)
print("  DealFlow360 — Comprehensive Sample Data Seeder")
print("=" * 60)

# ═══════════════════════════════════════════════════════════════
# 1. USERS (6 users across all roles)
# ═══════════════════════════════════════════════════════════════
existing_users = {u.email: u for u in db.query(User).all()}

users_data = [
    ("admin@dealflow.com",    "Admin User",      Role.ADMIN),
    ("j.rao@dealflow.com",    "J. Rao",          Role.SALES_REP),
    ("s.patel@dealflow.com",  "S. Patel",        Role.SALES_REP),
    ("m.shah@dealflow.com",   "M. Shah",         Role.SALES_MANAGER),
    ("r.iyer@dealflow.com",   "R. Iyer",         Role.FINANCE_OPS),
    ("c.kumar@dealflow.com",  "C. Kumar",        Role.CUSTOMER),
]

users = {}
for email, name, role in users_data:
    if email in existing_users:
        users[email] = existing_users[email]
    else:
        u = User(email=email, full_name=name, role=role, hashed_password=hash_password("password123"))
        db.add(u)
        db.flush()
        users[email] = u

db.commit()
print(f"✓ Users: {len(users)}")

# Convenience references
rep1     = users["j.rao@dealflow.com"]
rep2     = users["s.patel@dealflow.com"]
manager  = users["m.shah@dealflow.com"]
finance  = users["r.iyer@dealflow.com"]
admin    = users["admin@dealflow.com"]

# ═══════════════════════════════════════════════════════════════
# 2. CUSTOMERS (8 customers across tiers)
# ═══════════════════════════════════════════════════════════════
existing_customers = {c.name: c for c in db.query(Customer).all()}

customers_data = [
    ("Acme Corp",           "acme@example.com",       CustomerTier.GOLD),
    ("Bela Industries",     "bela@example.com",       CustomerTier.SILVER),
    ("Nova Retail",         "nova@example.com",        CustomerTier.BRONZE),
    ("TechVault Inc",       "techvault@example.com",   CustomerTier.GOLD),
    ("GreenLeaf Solutions", "greenleaf@example.com",   CustomerTier.SILVER),
    ("Starlight Dynamics",  "starlight@example.com",   CustomerTier.GOLD),
    ("Terra Motors OEM",    "terra@example.com",        CustomerTier.SILVER),
    ("Zenith Retail AI",    "zenith@example.com",       CustomerTier.BRONZE),
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
print(f"✓ Customers: {len(customers)}")

# ═══════════════════════════════════════════════════════════════
# 3. PRODUCTS (8 products with categories, descriptions, tax)
# ═══════════════════════════════════════════════════════════════
existing_products = {p.name: p for p in db.query(Product).all()}

products_data = [
    ("Laptop Pro 15",          "Hardware",  Decimal("1200.00"), "each",  Decimal("18.00"), "High-performance business laptop with 15\" display"),
    ("Server Rack X500",       "Hardware",  Decimal("4500.00"), "each",  Decimal("18.00"), "Enterprise-grade 42U server rack"),
    ("Setup Service",          "Services",  Decimal("500.00"),  "hour",  Decimal("18.00"), "On-site hardware setup and installation"),
    ("Care Plan 2yr",          "Services",  Decimal("300.00"),  "each",  Decimal("18.00"), "Extended 2-year care and support plan"),
    ("Cloud License Pro",      "Software",  Decimal("800.00"),  "seat",  Decimal("18.00"), "Enterprise cloud platform license per seat"),
    ("Security Suite",         "Software",  Decimal("350.00"),  "seat",  Decimal("18.00"), "Endpoint security and threat protection"),
    ("Network Switch 48P",     "Hardware",  Decimal("2200.00"), "each",  Decimal("18.00"), "48-port managed gigabit network switch"),
    ("Consulting Package",     "Services",  Decimal("1500.00"), "pkg",   Decimal("18.00"), "40-hour consulting and advisory package"),
]

products = {}
for name, cat, price, unit, tax, desc in products_data:
    if name in existing_products:
        products[name] = existing_products[name]
    else:
        p = Product(name=name, category=cat, base_price=price, unit=unit, tax_rate=tax, description=desc)
        db.add(p)
        db.flush()
        products[name] = p

db.commit()
print(f"✓ Products: {len(products)}")

# ═══════════════════════════════════════════════════════════════
# 4. DISCOUNT RULES
# ═══════════════════════════════════════════════════════════════
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
print("✓ Discount rules seeded")

# ═══════════════════════════════════════════════════════════════
# 5. QUOTATIONS with lines (12 quotations in various statuses)
# ═══════════════════════════════════════════════════════════════
# Clear dependent data first to avoid FK issues
db.query(AuditLogEntry).delete()
db.query(ApprovalStep).delete()
db.query(ApprovalRequest).delete()
db.query(CreditNote).delete()
db.query(Payment).delete()
db.query(Invoice).delete()
db.query(StalledDealFlag).delete()
db.query(DiscountAnomalyFlag).delete()
db.query(Backorder).delete()
db.query(FulfillmentSplitLine).delete()
db.query(FulfillmentSplit).delete()
db.query(BillingSchedule).delete()
db.query(QuotationLine).delete()
db.query(Quotation).delete()
db.commit()

quotations = {}

def add_quote(key, customer_name, rep, status, days_ago, lines_data):
    """Helper: create a quotation with lines and return it."""
    q = Quotation(
        customer_id=customers[customer_name].id,
        rep_id=rep.id,
        status=status,
        created_at=now - timedelta(days=days_ago),
        updated_at=now - timedelta(days=max(0, days_ago - 2)),
    )
    db.add(q)
    db.flush()

    for prod_name, qty, disc in lines_data:
        p = products[prod_name]
        unit_price = float(p.base_price)
        disc_amt = unit_price * qty * (disc / 100)
        line_total = (unit_price * qty) - disc_amt
        db.add(QuotationLine(
            quotation_id=q.id,
            product_id=p.id,
            quantity=Decimal(str(qty)),
            unit_price=p.base_price,
            discount_percent=Decimal(str(disc)),
            line_total=Decimal(str(round(line_total, 2))),
            category_snapshot=p.category,
        ))

    db.flush()
    quotations[key] = q
    return q


# Q1: Acme Corp — Pending Approval (high risk) — 3 days old
add_quote("q1", "Acme Corp", rep1, QuotationStatus.PENDING_APPROVAL, 3, [
    ("Laptop Pro 15",     10, 12),    # ₹10,560
    ("Setup Service",      5, 18),    # ₹2,050
    ("Care Plan 2yr",     10,  5),    # ₹2,850
])

# Q2: Bela Industries — Pending Approval (at finance) — 5 days old
add_quote("q2", "Bela Industries", rep2, QuotationStatus.PENDING_APPROVAL, 5, [
    ("Server Rack X500",   2, 14),    # ₹7,740
    ("Cloud License Pro", 20, 13),    # ₹13,920
])

# Q3: Nova Retail — Approved (low risk) — 10 days old
add_quote("q3", "Nova Retail", rep1, QuotationStatus.APPROVED, 10, [
    ("Care Plan 2yr",     50,  3),    # ₹14,550
])

# Q4: TechVault — Draft (returned, stale) — 12 days old (will trigger stalled)
q4 = Quotation(
    customer_id=customers["TechVault Inc"].id,
    rep_id=rep2.id,
    status=QuotationStatus.DRAFT,
    created_at=now - timedelta(days=12),
    updated_at=now - timedelta(days=10),  # stale for 10 days — triggers stalled flag
)
db.add(q4)
db.flush()
db.add(QuotationLine(
    quotation_id=q4.id, product_id=products["Cloud License Pro"].id,
    quantity=100, unit_price=Decimal("800"), discount_percent=Decimal("20"),
    line_total=Decimal("64000"), category_snapshot="Software"
))
db.flush()
quotations["q4"] = q4

# Q5: GreenLeaf — Confirmed (fully approved) — 14 days old
add_quote("q5", "GreenLeaf Solutions", rep1, QuotationStatus.CONFIRMED, 14, [
    ("Laptop Pro 15",     25, 11),    # ₹26,700
    ("Care Plan 2yr",     25,  9),    # ₹6,825
])

# Q6: Starlight Dynamics — Under Negotiation — 8 days old (will trigger stalled)
q6 = Quotation(
    customer_id=customers["Starlight Dynamics"].id,
    rep_id=rep1.id,
    status=QuotationStatus.UNDER_NEGOTIATION,
    created_at=now - timedelta(days=8),
    updated_at=now - timedelta(days=7),  # stale 7 days — triggers stalled
)
db.add(q6)
db.flush()
db.add(QuotationLine(
    quotation_id=q6.id, product_id=products["Consulting Package"].id,
    quantity=3, unit_price=Decimal("1500"), discount_percent=Decimal("8"),
    line_total=Decimal("4140"), category_snapshot="Services"
))
db.add(QuotationLine(
    quotation_id=q6.id, product_id=products["Security Suite"].id,
    quantity=50, unit_price=Decimal("350"), discount_percent=Decimal("10"),
    line_total=Decimal("15750"), category_snapshot="Software"
))
db.flush()
quotations["q6"] = q6

# Q7: Terra Motors — Approved — 6 days old
add_quote("q7", "Terra Motors OEM", rep2, QuotationStatus.APPROVED, 6, [
    ("Network Switch 48P",  5,  7),   # ₹10,230
    ("Setup Service",      10,  5),   # ₹4,750
])

# Q8: Zenith Retail — Sent — 4 days old
add_quote("q8", "Zenith Retail AI", rep1, QuotationStatus.SENT, 4, [
    ("Cloud License Pro", 15,  5),    # ₹11,400
    ("Security Suite",    30,  8),    # ₹9,660
])

# Q9: Acme Corp — Fulfilled — 20 days old
add_quote("q9", "Acme Corp", rep1, QuotationStatus.FULFILLED, 20, [
    ("Laptop Pro 15",     50,  8),    # ₹55,200
    ("Care Plan 2yr",     50,  5),    # ₹14,250
    ("Setup Service",     20,  3),    # ₹9,700
])

# Q10: Bela Industries — Rejected — 15 days old
add_quote("q10", "Bela Industries", rep2, QuotationStatus.REJECTED, 15, [
    ("Consulting Package",  2,  0),   # ₹3,000
])

# Q11: Nova Retail — Draft — 1 day old
add_quote("q11", "Nova Retail", rep2, QuotationStatus.DRAFT, 1, [
    ("Laptop Pro 15",      5,  0),    # ₹6,000
    ("Security Suite",    10,  0),    # ₹3,500
])

# Q12: Starlight Dynamics — Confirmed — 18 days old
add_quote("q12", "Starlight Dynamics", rep2, QuotationStatus.CONFIRMED, 18, [
    ("Server Rack X500",   3,  10),   # ₹12,150
    ("Network Switch 48P", 6,  5),    # ₹12,540
    ("Consulting Package",  1,  0),   # ₹1,500
])

db.commit()
print(f"✓ Quotations: {len(quotations)}")

# ═══════════════════════════════════════════════════════════════
# 6. APPROVAL REQUESTS & AUDIT TRAIL
# ═══════════════════════════════════════════════════════════════
# AR1: Q1 — Pending at Manager
ar1 = ApprovalRequest(
    quotation_id=quotations["q1"].id, current_step=1,
    status=ApprovalStatus.PENDING_MANAGER, blended_risk_score=Decimal("8.5"),
    created_at=now - timedelta(days=3)
)
db.add(ar1)
db.flush()
db.add(ApprovalStep(approval_request_id=ar1.id, step_number=1, approver_role=Role.SALES_MANAGER))
db.add(ApprovalStep(approval_request_id=ar1.id, step_number=2, approver_role=Role.FINANCE_OPS))
db.add(AuditLogEntry(user_id=rep1.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar1.id, reason="Initial 12% discount request", timestamp=now - timedelta(days=3)))
db.add(AuditLogEntry(user_id=manager.id, action="Returned", entity_type="approval_request",
                      entity_id=ar1.id, reason="Requested justification for high discount", timestamp=now - timedelta(days=2)))
db.add(AuditLogEntry(user_id=rep1.id, action="Resubmitted", entity_type="approval_request",
                      entity_id=ar1.id, reason="Added competitive margin note", timestamp=now - timedelta(days=1)))

# AR2: Q2 — Pending at Finance
ar2 = ApprovalRequest(
    quotation_id=quotations["q2"].id, current_step=2,
    status=ApprovalStatus.PENDING_FINANCE, blended_risk_score=Decimal("3.2"),
    created_at=now - timedelta(days=5)
)
db.add(ar2)
db.flush()
db.add(ApprovalStep(approval_request_id=ar2.id, step_number=1, approver_role=Role.SALES_MANAGER,
                     decision="APPROVED", decided_by=manager.id, decided_at=now - timedelta(days=4), reason="Looks good"))
db.add(ApprovalStep(approval_request_id=ar2.id, step_number=2, approver_role=Role.FINANCE_OPS))
db.add(AuditLogEntry(user_id=rep2.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar2.id, reason="Bulk server order", timestamp=now - timedelta(days=5)))
db.add(AuditLogEntry(user_id=manager.id, action="APPROVE", entity_type="approval_request",
                      entity_id=ar2.id, reason="Looks good", timestamp=now - timedelta(days=4)))

# AR3: Q3 — Auto Approved (low risk)
ar3 = ApprovalRequest(
    quotation_id=quotations["q3"].id, current_step=1,
    status=ApprovalStatus.APPROVED, blended_risk_score=Decimal("0"),
    created_at=now - timedelta(days=10)
)
db.add(ar3)
db.flush()

# AR4: Q4 — Returned
ar4 = ApprovalRequest(
    quotation_id=quotations["q4"].id, current_step=1,
    status=ApprovalStatus.RETURNED, blended_risk_score=Decimal("8.0"),
    created_at=now - timedelta(days=12)
)
db.add(ar4)
db.flush()
db.add(ApprovalStep(approval_request_id=ar4.id, step_number=1, approver_role=Role.SALES_MANAGER,
                     decision="RETURNED", decided_by=manager.id, decided_at=now - timedelta(days=11), reason="Discount too high for Bronze tier"))
db.add(AuditLogEntry(user_id=rep2.id, action="Submitted", entity_type="approval_request",
                      entity_id=ar4.id, reason="Enterprise volume deal", timestamp=now - timedelta(days=12)))
db.add(AuditLogEntry(user_id=manager.id, action="RETURN", entity_type="approval_request",
                      entity_id=ar4.id, reason="Discount too high", timestamp=now - timedelta(days=11)))

# AR5: Q5 — Fully Approved (Manager + Finance)
ar5 = ApprovalRequest(
    quotation_id=quotations["q5"].id, current_step=2,
    status=ApprovalStatus.APPROVED, blended_risk_score=Decimal("2.0"),
    created_at=now - timedelta(days=14)
)
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
print("✓ Approval requests: 5 (2 Pending, 1 Returned, 2 Approved)")

# ═══════════════════════════════════════════════════════════════
# 7. WAREHOUSES & STOCK
# ═══════════════════════════════════════════════════════════════
db.query(WarehouseStock).delete()
db.query(Warehouse).delete()
db.commit()

warehouses = {}
for wname, wloc, cost_w in [
    ("Mumbai Central WH",  "Mumbai, Maharashtra",   1.0),
    ("Delhi NCR WH",       "Gurgaon, Haryana",      1.2),
    ("Bangalore South WH", "Bangalore, Karnataka",   0.8),
]:
    w = Warehouse(name=wname, location=wloc, shipping_cost_weight=cost_w)
    db.add(w)
    db.flush()
    warehouses[wname] = w

# Stock entries — each warehouse stocks all products
for wname, wh in warehouses.items():
    for pname, prod in products.items():
        qty = 100 if "Mumbai" in wname else (75 if "Delhi" in wname else 50)
        db.add(WarehouseStock(
            warehouse_id=wh.id, product_id=prod.id,
            quantity_on_hand=qty, reserved_quantity=0,
            replenishment_threshold=10, replenishment_lead_time_days=5
        ))

db.commit()
print(f"✓ Warehouses: {len(warehouses)} with stock for {len(products)} products each")

# ═══════════════════════════════════════════════════════════════
# 8. FULFILLMENT SPLITS (4 splits for confirmed/fulfilled quotes)
# ═══════════════════════════════════════════════════════════════
wh_mumbai = warehouses["Mumbai Central WH"]
wh_delhi = warehouses["Delhi NCR WH"]
wh_blr = warehouses["Bangalore South WH"]

# Fulfillment for Q5 (Confirmed — GreenLeaf)
fs1 = FulfillmentSplit(quotation_id=quotations["q5"].id, status=FulfillmentStatus.ACCEPTED)
db.add(fs1)
db.flush()
q5_lines = db.query(QuotationLine).filter(QuotationLine.quotation_id == quotations["q5"].id).all()
for ln in q5_lines:
    db.add(FulfillmentSplitLine(
        fulfillment_split_id=fs1.id, quotation_line_id=ln.id,
        warehouse_id=wh_mumbai.id, quantity_fulfilled=int(ln.quantity),
        quantity_backordered=0
    ))

# Fulfillment for Q9 (Fulfilled — Acme)
fs2 = FulfillmentSplit(quotation_id=quotations["q9"].id, status=FulfillmentStatus.FULFILLED)
db.add(fs2)
db.flush()
q9_lines = db.query(QuotationLine).filter(QuotationLine.quotation_id == quotations["q9"].id).all()
for ln in q9_lines:
    db.add(FulfillmentSplitLine(
        fulfillment_split_id=fs2.id, quotation_line_id=ln.id,
        warehouse_id=wh_delhi.id, quantity_fulfilled=int(ln.quantity),
        quantity_backordered=0
    ))

# Fulfillment for Q7 (Approved — Terra Motors) — partially fulfilled with backorder
fs3 = FulfillmentSplit(quotation_id=quotations["q7"].id, status=FulfillmentStatus.PARTIALLY_FULFILLED)
db.add(fs3)
db.flush()
q7_lines = db.query(QuotationLine).filter(QuotationLine.quotation_id == quotations["q7"].id).all()
for i, ln in enumerate(q7_lines):
    full_qty = int(ln.quantity) if i == 1 else max(1, int(ln.quantity) - 2)
    back_qty = 0 if i == 1 else int(ln.quantity) - full_qty
    fsl = FulfillmentSplitLine(
        fulfillment_split_id=fs3.id, quotation_line_id=ln.id,
        warehouse_id=wh_blr.id, quantity_fulfilled=full_qty,
        quantity_backordered=back_qty
    )
    db.add(fsl)
    db.flush()
    if back_qty > 0:
        db.add(Backorder(
            fulfillment_split_line_id=fsl.id,
            quantity_remaining=back_qty,
            status=BackorderStatus.OPEN
        ))

# Fulfillment for Q12 (Confirmed — Starlight)
fs4 = FulfillmentSplit(quotation_id=quotations["q12"].id, status=FulfillmentStatus.SUGGESTED)
db.add(fs4)
db.flush()
q12_lines = db.query(QuotationLine).filter(QuotationLine.quotation_id == quotations["q12"].id).all()
for ln in q12_lines:
    db.add(FulfillmentSplitLine(
        fulfillment_split_id=fs4.id, quotation_line_id=ln.id,
        warehouse_id=wh_mumbai.id, quantity_fulfilled=0,
        quantity_backordered=int(ln.quantity)
    ))

db.commit()
print("✓ Fulfillment splits: 4 (1 Fulfilled, 1 Accepted, 1 Partially Fulfilled, 1 Suggested)")

# ═══════════════════════════════════════════════════════════════
# 9. INVOICES, PAYMENTS & CREDIT NOTES
# ═══════════════════════════════════════════════════════════════
# Invoice for Q9 (Fulfilled) — PAID
inv1 = Invoice(quotation_id=quotations["q9"].id, amount=Decimal("79150.00"), status=InvoiceStatus.PAID,
               created_at=now - timedelta(days=18))
db.add(inv1)
db.flush()
db.add(Payment(invoice_id=inv1.id, amount=Decimal("79150.00"), paid_at=now - timedelta(days=16), reference="TXN-20260821-001"))

# Invoice for Q5 (Confirmed) — PARTIALLY PAID
inv2 = Invoice(quotation_id=quotations["q5"].id, amount=Decimal("33525.00"), status=InvoiceStatus.PARTIALLY_PAID,
               created_at=now - timedelta(days=12))
db.add(inv2)
db.flush()
db.add(Payment(invoice_id=inv2.id, amount=Decimal("20000.00"), paid_at=now - timedelta(days=10), reference="TXN-20260825-002"))

# Invoice for Q7 (Approved) — UNPAID
inv3 = Invoice(quotation_id=quotations["q7"].id, amount=Decimal("14980.00"), status=InvoiceStatus.UNPAID,
               created_at=now - timedelta(days=5))
db.add(inv3)
db.flush()

# Invoice for Q12 (Confirmed) — PAID with credit note
inv4 = Invoice(quotation_id=quotations["q12"].id, amount=Decimal("26190.00"), status=InvoiceStatus.PAID,
               created_at=now - timedelta(days=16))
db.add(inv4)
db.flush()
db.add(Payment(invoice_id=inv4.id, amount=Decimal("26190.00"), paid_at=now - timedelta(days=14), reference="TXN-20260821-003"))
db.add(CreditNote(invoice_id=inv4.id, amount=Decimal("1500.00"), reason="Consulting scope reduced by 1 session",
                   created_at=now - timedelta(days=13)))

# Invoice for Q3 (Approved) — UNPAID
inv5 = Invoice(quotation_id=quotations["q3"].id, amount=Decimal("14550.00"), status=InvoiceStatus.UNPAID,
               created_at=now - timedelta(days=9))
db.add(inv5)
db.flush()

# Invoice for Q8 (Sent — speculative advance invoice) — UNPAID
inv6 = Invoice(quotation_id=quotations["q8"].id, amount=Decimal("21060.00"), status=InvoiceStatus.UNPAID,
               created_at=now - timedelta(days=3))
db.add(inv6)
db.flush()

db.commit()
print("✓ Invoices: 6 (2 Paid, 1 Partially Paid, 3 Unpaid) with payments and credit notes")

# ═══════════════════════════════════════════════════════════════
# 10. SUBSCRIPTION PLANS, BILLING SCHEDULES, PRORATION & CANCELLATION RULES
# ═══════════════════════════════════════════════════════════════
db.query(ProrationRule).delete()
db.query(CancellationRule).delete()
db.query(SubscriptionPlan).delete()
db.commit()

sub_plans = {}

# Plan 1: Monthly Cloud License
sp1 = SubscriptionPlan(
    name="Cloud License Pro — Monthly", cadence=SubscriptionCadence.MONTHLY,
    product_id=products["Cloud License Pro"].id, price=Decimal("800.00"), is_active=True
)
db.add(sp1)
db.flush()
sub_plans["monthly_cloud"] = sp1
db.add(ProrationRule(plan_id=sp1.id, rule_type="days_remaining_ratio", config_json={"rounding": "ceil"}))
db.add(CancellationRule(plan_id=sp1.id, refund_type=RefundType.PARTIAL, config_json={"notice_days": 7}))

# Plan 2: Quarterly Security Suite
sp2 = SubscriptionPlan(
    name="Security Suite — Quarterly", cadence=SubscriptionCadence.QUARTERLY,
    product_id=products["Security Suite"].id, price=Decimal("950.00"), is_active=True
)
db.add(sp2)
db.flush()
sub_plans["quarterly_security"] = sp2
db.add(ProrationRule(plan_id=sp2.id, rule_type="days_remaining_ratio", config_json={"rounding": "floor"}))
db.add(CancellationRule(plan_id=sp2.id, refund_type=RefundType.FULL, config_json={"notice_days": 14}))

# Plan 3: Yearly Care Plan
sp3 = SubscriptionPlan(
    name="Care Plan Premium — Yearly", cadence=SubscriptionCadence.YEARLY,
    product_id=products["Care Plan 2yr"].id, price=Decimal("3200.00"), is_active=True
)
db.add(sp3)
db.flush()
sub_plans["yearly_care"] = sp3
db.add(ProrationRule(plan_id=sp3.id, rule_type="days_remaining_ratio", config_json={"rounding": "ceil"}))
db.add(CancellationRule(plan_id=sp3.id, refund_type=RefundType.NONE, config_json={"notice_days": 30}))

db.commit()

# Billing schedules — link to Q5 lines as an example of a subscription-attached quote
q5_line_1 = db.query(QuotationLine).filter(QuotationLine.quotation_id == quotations["q5"].id).first()
if q5_line_1:
    for i in range(6):  # 6 monthly billing cycles
        bill_date = date.today() + timedelta(days=30 * i)
        status = ScheduleStatus.BILLED if i < 2 else ScheduleStatus.SCHEDULED
        db.add(BillingSchedule(
            quotation_line_id=q5_line_1.id, plan_id=sp1.id,
            billing_date=bill_date, amount=Decimal("800.00"), status=status
        ))

db.commit()
print(f"✓ Subscription plans: {len(sub_plans)} with billing schedules, proration & cancellation rules")

# ═══════════════════════════════════════════════════════════════
# 11. DEAL HEALTH FLAGS (pre-seed for immediate visibility)
# ═══════════════════════════════════════════════════════════════
# Stalled deals: Q4 (Draft, 10 days stale), Q6 (Under Negotiation, 7 days stale)
db.add(StalledDealFlag(quotation_id=quotations["q4"].id, days_inactive=10, flagged_at=now - timedelta(days=1)))
db.add(StalledDealFlag(quotation_id=quotations["q6"].id, days_inactive=7, flagged_at=now - timedelta(days=1)))

# Also add Q2 as stalled (Pending Approval for 5 days, but updated_at is stale)
# Update Q2's updated_at to make it stale
q2_obj = quotations["q2"]
q2_obj.updated_at = now - timedelta(days=6)
db.add(q2_obj)
db.add(StalledDealFlag(quotation_id=q2_obj.id, days_inactive=6, flagged_at=now - timedelta(hours=12)))

# Discount anomalies: Q4 (20% discount vs avg 10%), Q6 lines
db.add(DiscountAnomalyFlag(
    quotation_id=quotations["q4"].id, rep_id=rep2.id,
    discount_given=Decimal("20.00"), rep_average_discount=Decimal("10.00"),
    flagged_at=now - timedelta(days=1)
))
db.add(DiscountAnomalyFlag(
    quotation_id=quotations["q1"].id, rep_id=rep1.id,
    discount_given=Decimal("18.00"), rep_average_discount=Decimal("8.50"),
    flagged_at=now - timedelta(hours=6)
))

db.commit()
print("✓ Deal health flags: 3 stalled, 2 discount anomalies")

# ═══════════════════════════════════════════════════════════════
# 12. UPSELL / CROSS-SELL RULES & PROMOTIONS
# ═══════════════════════════════════════════════════════════════
db.query(ProductPairingRule).delete()
db.query(ProductPromotion).delete()
db.query(UpsellConfig).delete()
db.commit()

# Pairing rules
pairings = [
    ("Laptop Pro 15",      "Care Plan 2yr",       0.85),
    ("Laptop Pro 15",      "Setup Service",       0.72),
    ("Server Rack X500",   "Network Switch 48P",  0.90),
    ("Server Rack X500",   "Setup Service",       0.65),
    ("Cloud License Pro",  "Security Suite",      0.88),
    ("Cloud License Pro",  "Consulting Package",  0.55),
    ("Security Suite",     "Care Plan 2yr",       0.60),
    ("Network Switch 48P", "Consulting Package",  0.45),
]
for base_name, sugg_name, score in pairings:
    db.add(ProductPairingRule(
        base_product_id=products[base_name].id,
        suggested_product_id=products[sugg_name].id,
        co_purchase_score=score
    ))

# Promotions
db.add(ProductPromotion(
    product_id=products["Cloud License Pro"].id, is_promoted=True,
    promo_label="🔥 Hot Deal — 15% off this quarter",
    starts_at=now - timedelta(days=15), ends_at=now + timedelta(days=75)
))
db.add(ProductPromotion(
    product_id=products["Care Plan 2yr"].id, is_promoted=True,
    promo_label="Bundle & Save — Pair with any hardware",
    starts_at=now - timedelta(days=5), ends_at=now + timedelta(days=90)
))

# Upsell config
for key, val in [("max_suggestions", "3"), ("min_score_threshold", "0.4"), ("boost_promoted", "true")]:
    db.add(UpsellConfig(key=key, value=val))

db.commit()
print("✓ Upsell rules: 8 pairings, 2 promotions, 3 config entries")

# ═══════════════════════════════════════════════════════════════
# 13. PRICE LISTS (tier-based)
# ═══════════════════════════════════════════════════════════════
db.query(PriceListEntry).delete()
db.query(PriceList).delete()
db.commit()

price_lists = {}
for pl_name, tier, currency in [
    ("Gold Q3 2026",   CustomerTier.GOLD,   "INR"),
    ("Silver Q3 2026", CustomerTier.SILVER,  "INR"),
    ("Bronze Q3 2026", CustomerTier.BRONZE,  "INR"),
]:
    pl = PriceList(
        name=pl_name, customer_tier=tier, currency=currency,
        effective_from=date(2026, 7, 1), effective_to=date(2026, 9, 30)
    )
    db.add(pl)
    db.flush()
    price_lists[pl_name] = pl

# Price overrides: Gold gets best prices, Bronze gets base prices
multipliers = {"Gold Q3 2026": Decimal("0.90"), "Silver Q3 2026": Decimal("0.95"), "Bronze Q3 2026": Decimal("1.00")}
for pl_name, pl in price_lists.items():
    mult = multipliers[pl_name]
    for pname, prod in products.items():
        db.add(PriceListEntry(
            price_list_id=pl.id, product_id=prod.id,
            resolved_price=(prod.base_price * mult).quantize(Decimal("0.01"))
        ))

db.commit()
print(f"✓ Price lists: {len(price_lists)} with {len(products)} entries each")

# ═══════════════════════════════════════════════════════════════
# 14. GENERAL AUDIT LOGS
# ═══════════════════════════════════════════════════════════════
audit_entries = [
    (rep1.id,    "Quotation", quotations["q1"].id,  "create",    "Created new deal for Acme Corp",           now - timedelta(days=3)),
    (rep2.id,    "Quotation", quotations["q2"].id,  "create",    "Created new deal for Bela Industries",      now - timedelta(days=5)),
    (manager.id, "Quotation", quotations["q3"].id,  "approve",   "Auto-approved low-risk deal",               now - timedelta(days=10)),
    (rep1.id,    "Quotation", quotations["q5"].id,  "create",    "Quarterly hardware refresh for GreenLeaf",  now - timedelta(days=14)),
    (finance.id, "Invoice",   inv1.id,              "payment",   "Full payment received for Acme Corp",       now - timedelta(days=16)),
    (admin.id,   "Quotation", quotations["q9"].id,  "fulfill",   "Order fully fulfilled and shipped",         now - timedelta(days=18)),
    (rep2.id,    "Quotation", quotations["q7"].id,  "create",    "Terra Motors networking equipment order",    now - timedelta(days=6)),
    (rep1.id,    "Quotation", quotations["q8"].id,  "send",      "Quotation sent to Zenith Retail AI",        now - timedelta(days=4)),
]

for uid, etype, eid, action, reason, ts in audit_entries:
    db.add(AuditLog(entity_type=etype, entity_id=eid, user_id=uid, action=action, reason=reason, timestamp=ts))

db.commit()
print("✓ Audit logs: 8 entries")

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
print()
print("=" * 60)
print("  ✅ All sample data seeded successfully!")
print("=" * 60)
print(f"  Users:              {len(users)}")
print(f"  Customers:          {len(customers)}")
print(f"  Products:           {len(products)}")
print(f"  Quotations:         {len(quotations)}")
print(f"  Approval Requests:  5")
print(f"  Warehouses:         {len(warehouses)}")
print(f"  Fulfillment Splits: 4")
print(f"  Invoices:           6")
print(f"  Subscription Plans: {len(sub_plans)}")
print(f"  Deal Health Flags:  5 (3 stalled + 2 anomalies)")
print(f"  Upsell Rules:       8 pairings + 2 promotions")
print(f"  Price Lists:        {len(price_lists)}")
print()
print("  Login credentials: any user email / password123")
print("  Admin:   admin@dealflow.com")
print("  Manager: m.shah@dealflow.com")
print("  Rep:     j.rao@dealflow.com")
print("=" * 60)

db.close()
