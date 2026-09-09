"""Comprehensive Database Seeder for DealFlow360.
Populates 15-20 rich, interconnected enterprise records per table across the entire domain model.
"""

from datetime import date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from app.core.security import hash_password
from app.db.base_class import Base
from app.db.session import SessionLocal, engine

# Import all models to register with Base.metadata
from app.models.approval import ApprovalRequest, ApprovalStatus, ApprovalStep, AuditLogEntry
from app.models.audit_log import AuditLog
from app.models.customer import Customer, CustomerTier
from app.models.deal_health import DiscountAnomalyFlag, StalledDealFlag
from app.models.discount import ApprovalChainConfig, ApprovalLevel, CategoryDiscountCeiling, DiscountTier
from app.models.fulfillment import Backorder, BackorderStatus, FulfillmentSplit, FulfillmentSplitLine, FulfillmentStatus
from app.models.invoice import CreditNote, Invoice, InvoiceStatus, Payment
from app.models.negotiation import NegotiationAuthorType, NegotiationMessage, NegotiationMessageType, NegotiationStatus, NegotiationThread
from app.models.portal import PortalAccess
from app.models.pricing import PriceList, PriceListEntry
from app.models.product import Product, Variant
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
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock


def seed_all() -> None:
    """Reset the database and seed 15+ records for every domain table."""
    print("Dropping existing database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        now = datetime.now()
        today = date.today()

        # ----------------------------------------------------
        # 1. USERS (16 Records)
        # ----------------------------------------------------
        print("Seeding Users...")
        default_pwd = hash_password("ChangeMe123!")
        users_data = [
            ("admin@dealflow360.com", "System Admin", Role.ADMIN),
            ("admin2@dealflow360.com", "Victoria Vance (VP Ops)", Role.ADMIN),
            ("manager@dealflow360.com", "Marcus Holloway (Sales Director)", Role.SALES_MANAGER),
            ("sarah.manager@dealflow360.com", "Sarah Jenkins (Regional Sales Manager)", Role.SALES_MANAGER),
            ("michael.chief@dealflow360.com", "Michael Ross (CRO)", Role.SALES_MANAGER),
            ("rep@dealflow360.com", "Alex Mercer (Enterprise Rep)", Role.SALES_REP),
            ("jessica.rep@dealflow360.com", "Jessica Pearson (Senior AE)", Role.SALES_REP),
            ("david.hunter@dealflow360.com", "David Hunter (Strategic AE)", Role.SALES_REP),
            ("emily.exec@dealflow360.com", "Emily Watson (Mid-Market Rep)", Role.SALES_REP),
            ("ryan.sales@dealflow360.com", "Ryan Vance (Account Executive)", Role.SALES_REP),
            ("finance@dealflow360.com", "Louis Litt (Finance Controller)", Role.FINANCE_OPS),
            ("robert.finance@dealflow360.com", "Robert Zane (CFO)", Role.FINANCE_OPS),
            ("clara.controller@dealflow360.com", "Clara Oswald (Billing Analyst)", Role.FINANCE_OPS),
            ("customer@dealflow360.com", "Harvey Specter (Starlight VP Procurement)", Role.CUSTOMER),
            ("starlight.buyer@dealflow360.com", "Donna Paulsen (Starlight Ops)", Role.CUSTOMER),
            ("nexus.procure@dealflow360.com", "Dr. Harrison Wells (Nexus Robotics)", Role.CUSTOMER),
        ]
        users = []
        for email, full_name, role in users_data:
            u = User(email=email, full_name=full_name, role=role, hashed_password=default_pwd, is_active=True)
            session.add(u)
            users.append(u)
        session.flush()

        # Map users by role for fast lookup
        reps = [u for u in users if u.role == Role.SALES_REP]
        managers = [u for u in users if u.role == Role.SALES_MANAGER]
        finance_users = [u for u in users if u.role == Role.FINANCE_OPS]

        # ----------------------------------------------------
        # 2. CUSTOMERS (15 Records)
        # ----------------------------------------------------
        print("Seeding Customers...")
        customers_data = [
            ("Starlight Dynamics Inc.", "starlight.buyer@dealflow360.com", CustomerTier.GOLD),
            ("Nexus Robotics Corp.", "nexus.procure@dealflow360.com", CustomerTier.GOLD),
            ("Apex Cloud Systems", "procurement@apexcloud.io", CustomerTier.GOLD),
            ("CyberPulse Defense", "vendor-desk@cyberpulse.sec", CustomerTier.GOLD),
            ("BioGen Health Solutions", "supplies@biogenhealth.com", CustomerTier.GOLD),
            ("Zenith Technologies Ltd.", "billing@zenithtech.uk", CustomerTier.SILVER),
            ("OmniChannel Logistics", "orders@omnichannel.com", CustomerTier.SILVER),
            ("Vanguard Financial Group", "ap@vanguardfin.com", CustomerTier.SILVER),
            ("Hyperion Aerospace", "contracts@hyperion.air", CustomerTier.SILVER),
            ("Quantum AI Labs", "lab-ops@quantumai.org", CustomerTier.SILVER),
            ("Solaris Renewable Energy", "accounts@solarisenergy.com", CustomerTier.BRONZE),
            ("Pinnacle Media Networks", "purchasing@pinnaclemedia.com", CustomerTier.BRONZE),
            ("Aegis Security Solutions", "contact@aegissec.com", CustomerTier.BRONZE),
            ("Echo Telecom Corp.", "finance@echotelecom.net", CustomerTier.BRONZE),
            ("Bronze Buyer", "bronze@dealflow360.com", CustomerTier.BRONZE),
            ("Silver Buyer", "silver@dealflow360.com", CustomerTier.SILVER),
            ("Gold Buyer", "gold@dealflow360.com", CustomerTier.GOLD),
            ("Portal Demo Customer", "customer@dealflow360.com", CustomerTier.GOLD),
        ]
        customers = []
        for name, email, tier in customers_data:
            c = Customer(name=name, email=email, tier=tier, portal_password_hash=default_pwd)
            session.add(c)
            customers.append(c)
        session.flush()

        # ----------------------------------------------------
        # 3. PRODUCTS & VARIANTS (15 Products + 8 Variants)
        # ----------------------------------------------------
        print("Seeding Products & Variants...")
        products_data = [
            ("Cloud Infrastructure Suite", "Software", Decimal("2500.00"), "month", Decimal("18.00"), "Scalable multi-cloud orchestration engine"),
            ("Enterprise AI Engine", "Software", Decimal("5000.00"), "month", Decimal("18.00"), "Predictive analytics and ML model training cluster"),
            ("Managed SOC & Cyber Defense", "Services", Decimal("4200.00"), "month", Decimal("18.00"), "24/7 Threat monitoring and automated incident response"),
            ("API Gateway & Middleware", "Software", Decimal("1200.00"), "month", Decimal("18.00"), "High-throughput microservices gateway"),
            ("Executive Onboarding & Deployment", "Professional Services", Decimal("8500.00"), "project", Decimal("18.00"), "Dedicated implementation engineering sprint"),
            ("Starter Cloud Service", "Services", Decimal("150.00"), "month", Decimal("18.00"), "Entry level cloud hosting and monitoring"),
            ("Business Operations Platform", "Software", Decimal("800.00"), "month", Decimal("18.00"), "Core ERP & CRM integration workflow tool"),
            ("Data Lake Analytics Appliance", "Hardware", Decimal("12500.00"), "unit", Decimal("18.00"), "High performance NVMe storage server blade"),
            ("Edge Gateway Node v4", "Hardware", Decimal("3200.00"), "unit", Decimal("18.00"), "Industrial IoT edge compute module"),
            ("Developer API License", "Software", Decimal("350.00"), "month", Decimal("18.00"), "Full API access with 10M call rate limit"),
            ("Premium SLA Support (24/7)", "Services", Decimal("1800.00"), "month", Decimal("18.00"), "Dedicated technical account engineer with 15min response"),
            ("ERP Integration Accelerator", "Services", Decimal("6000.00"), "project", Decimal("18.00"), "Custom connector development for Legacy SAP/Odoo"),
            ("Security Audit & Hardening", "Services", Decimal("3500.00"), "project", Decimal("18.00"), "Comprehensive penetration test and compliance certification"),
            ("Custom BI Dashboard Bundle", "Software", Decimal("950.00"), "month", Decimal("18.00"), "Real-time executive reporting suite"),
            ("High-Throughput Load Balancer", "Hardware", Decimal("4800.00"), "unit", Decimal("18.00"), "Layer 7 hardware load balancing appliance"),
        ]
        products = []
        for name, cat, price, unit, tax, desc in products_data:
            p = Product(name=name, category=cat, base_price=price, unit=unit, tax_rate=tax, description=desc, is_active=True)
            session.add(p)
            products.append(p)
        session.flush()

        # Add Variants
        variants_data = [
            (products[0].id, "RAM", "64GB DDR5", Decimal("300.00")),
            (products[0].id, "RAM", "128GB DDR5", Decimal("600.00")),
            (products[1].id, "GPU Accelerator", "Nvidia H100 Dual", Decimal("3500.00")),
            (products[7].id, "Storage Capacity", "64TB NVMe Raid 10", Decimal("4000.00")),
            (products[8].id, "Ruggedization", "IP67 Outdoor Enclosure", Decimal("500.00")),
            (products[10].id, "SLA Tier", "Platinum Dedicated Team", Decimal("1200.00")),
            (products[14].id, "Port Speed", "40GbE QSFP+", Decimal("1500.00")),
            (products[14].id, "Redundant Power", "Dual Hot-Swap PSU", Decimal("450.00")),
        ]
        variants = []
        for pid, attr, val, extra in variants_data:
            v = Variant(product_id=pid, attribute_name=attr, value=val, extra_price=extra)
            session.add(v)
            variants.append(v)
        session.flush()

        # ----------------------------------------------------
        # 4. WAREHOUSES & WAREHOUSE STOCK (5 Warehouses + Stock)
        # ----------------------------------------------------
        print("Seeding Warehouses & Stock...")
        warehouses_data = [
            ("Equinix NY4 North America Hub", "Secaucus, NJ, USA", 1.0),
            ("Frankfurt FRA1 European Gateway", "Frankfurt, DE", 1.15),
            ("Tokyo TY3 Asia-Pacific Hub", "Tokyo, JP", 1.25),
            ("London LD6 UK Regional Center", "Slough, UK", 1.10),
            ("Singapore SG1 SEA Data Center", "Singapore, SG", 1.20),
        ]
        warehouses = []
        for name, loc, weight in warehouses_data:
            w = Warehouse(name=name, location=loc, shipping_cost_weight=weight)
            session.add(w)
            warehouses.append(w)
        session.flush()

        for w in warehouses:
            for p in products:
                session.add(WarehouseStock(
                    warehouse_id=w.id,
                    product_id=p.id,
                    quantity_on_hand=350,
                    reserved_quantity=25,
                    replenishment_threshold=50,
                    replenishment_lead_time_days=7,
                ))
        session.flush()

        # ----------------------------------------------------
        # 5. DISCOUNT POLICY & APPROVAL CONFIG
        # ----------------------------------------------------
        print("Seeding Discount Policies...")
        discount_tiers_data = [
            (CustomerTier.BRONZE, Decimal("10.00")),
            (CustomerTier.SILVER, Decimal("20.00")),
            (CustomerTier.GOLD, Decimal("35.00")),
        ]
        for tier, max_disc in discount_tiers_data:
            session.add(DiscountTier(customer_tier=tier, max_discount_percent=max_disc))

        category_ceilings_data = [
            ("Software", Decimal("30.00")),
            ("Services", Decimal("25.00")),
            ("Hardware", Decimal("15.00")),
            ("Professional Services", Decimal("20.00")),
        ]
        for cat, max_disc in category_ceilings_data:
            session.add(CategoryDiscountCeiling(category=cat, max_discount_percent=max_disc))

        chain_configs = [
            (Decimal("0.00"), Decimal("15.00"), ApprovalLevel.MANAGER_ONLY),
            (Decimal("15.00"), Decimal("100.00"), ApprovalLevel.MANAGER_THEN_FINANCE),
        ]
        for min_s, max_s, lvl in chain_configs:
            session.add(ApprovalChainConfig(min_score=min_s, max_score=max_s, required_level=lvl))
        session.flush()

        # ----------------------------------------------------
        # 6. PRICE LISTS & ENTRIES
        # ----------------------------------------------------
        print("Seeding Price Lists...")
        price_lists_data = [
            ("Gold Enterprise Preferred 2026", CustomerTier.GOLD, "USD", today - timedelta(days=90), today + timedelta(days=275)),
            ("Silver Commercial Partner 2026", CustomerTier.SILVER, "USD", today - timedelta(days=90), today + timedelta(days=275)),
            ("Standard Commercial List 2026", CustomerTier.BRONZE, "USD", today - timedelta(days=90), today + timedelta(days=275)),
        ]
        price_lists = []
        for name, tier, curr, f_date, t_date in price_lists_data:
            pl = PriceList(name=name, customer_tier=tier, currency=curr, effective_from=f_date, effective_to=t_date)
            session.add(pl)
            price_lists.append(pl)
        session.flush()

        # Entries
        for pl in price_lists:
            disc_factor = Decimal("0.80") if pl.customer_tier == CustomerTier.GOLD else (Decimal("0.90") if pl.customer_tier == CustomerTier.SILVER else Decimal("1.00"))
            for p in products:
                session.add(PriceListEntry(
                    price_list_id=pl.id,
                    product_id=p.id,
                    variant_id=None,
                    resolved_price=(p.base_price * disc_factor).quantize(Decimal("0.01")),
                ))
        session.flush()

        # ----------------------------------------------------
        # 7. SUBSCRIPTION PLANS & RULES
        # ----------------------------------------------------
        print("Seeding Subscription Plans...")
        plans_data = [
            ("Cloud Infra Monthly Plan", SubscriptionCadence.MONTHLY, products[0].id, Decimal("2500.00")),
            ("Cloud Infra Annual Plan", SubscriptionCadence.YEARLY, products[0].id, Decimal("27000.00")),
            ("Enterprise AI Engine Monthly", SubscriptionCadence.MONTHLY, products[1].id, Decimal("5000.00")),
            ("Enterprise AI Engine Annual", SubscriptionCadence.YEARLY, products[1].id, Decimal("54000.00")),
            ("Managed SOC Monthly Guard", SubscriptionCadence.MONTHLY, products[2].id, Decimal("4200.00")),
            ("API Gateway Monthly Plan", SubscriptionCadence.MONTHLY, products[3].id, Decimal("1200.00")),
            ("Business Platform Monthly", SubscriptionCadence.MONTHLY, products[6].id, Decimal("800.00")),
            ("Developer API Annual Pass", SubscriptionCadence.YEARLY, products[9].id, Decimal("3800.00")),
            ("Premium SLA Support Monthly", SubscriptionCadence.MONTHLY, products[10].id, Decimal("1800.00")),
            ("Custom BI Dashboard Monthly", SubscriptionCadence.MONTHLY, products[13].id, Decimal("950.00")),
        ]
        sub_plans = []
        for name, cadence, pid, price in plans_data:
            sp = SubscriptionPlan(name=name, cadence=cadence, product_id=pid, price=price, is_active=True)
            session.add(sp)
            sub_plans.append(sp)
        session.flush()

        for sp in sub_plans:
            session.add(ProrationRule(plan_id=sp.id, rule_type="days_remaining_ratio", config_json={"precision": "daily"}))
            session.add(CancellationRule(plan_id=sp.id, refund_type=RefundType.PARTIAL, config_json={"fee_percent": 10}))
        session.flush()

        # ----------------------------------------------------
        # 8. QUOTATIONS & QUOTATION LINES (18 Quotations)
        # ----------------------------------------------------
        print("Seeding Quotations & Lines...")
        statuses = [
            QuotationStatus.DRAFT,
            QuotationStatus.PENDING_APPROVAL,
            QuotationStatus.APPROVED,
            QuotationStatus.SENT,
            QuotationStatus.UNDER_NEGOTIATION,
            QuotationStatus.CONFIRMED,
            QuotationStatus.FULFILLED,
            QuotationStatus.REJECTED,
        ]
        
        quotations = []
        quotation_lines = []

        for i in range(18):
            cust = customers[i % len(customers)]
            rep = reps[i % len(reps)]
            st = statuses[i % len(statuses)]
            q = Quotation(customer_id=cust.id, rep_id=rep.id, status=st, created_at=now - timedelta(days=20 - i))
            session.add(q)
            quotations.append(q)
        session.flush()

        for idx, q in enumerate(quotations):
            # Each quotation gets 2-3 lines
            p1 = products[idx % len(products)]
            p2 = products[(idx + 1) % len(products)]
            sp1 = sub_plans[idx % len(sub_plans)] if p1.category == "Software" else None

            q_line1 = QuotationLine(
                quotation_id=q.id,
                product_id=p1.id,
                plan_id=sp1.id if sp1 else None,
                quantity=Decimal(str((idx % 5) + 1)),
                unit_price=p1.base_price,
                discount_percent=Decimal(str((idx * 3) % 25)),
                line_total=(p1.base_price * Decimal(str((idx % 5) + 1)) * (Decimal("1.00") - Decimal(str((idx * 3) % 25)) / Decimal("100.00"))).quantize(Decimal("0.01")),
                category_snapshot=p1.category,
            )
            q_line2 = QuotationLine(
                quotation_id=q.id,
                product_id=p2.id,
                plan_id=None,
                quantity=Decimal(str((idx % 3) + 1)),
                unit_price=p2.base_price,
                discount_percent=Decimal("5.00"),
                line_total=(p2.base_price * Decimal(str((idx % 3) + 1)) * Decimal("0.95")).quantize(Decimal("0.01")),
                category_snapshot=p2.category,
            )
            session.add(q_line1)
            session.add(q_line2)
            quotation_lines.extend([q_line1, q_line2])
        session.flush()

        # ----------------------------------------------------
        # 9. APPROVAL REQUESTS, STEPS & AUDIT LOGS (15 Records)
        # ----------------------------------------------------
        print("Seeding Approval Requests & Steps...")
        for idx, q in enumerate(quotations[:15]):
            is_approved = q.status in [QuotationStatus.APPROVED, QuotationStatus.CONFIRMED, QuotationStatus.FULFILLED]
            is_rejected = q.status == QuotationStatus.REJECTED
            app_status = ApprovalStatus.APPROVED if is_approved else (
                ApprovalStatus.REJECTED if is_rejected else ApprovalStatus.PENDING_MANAGER
            )
            req = ApprovalRequest(
                quotation_id=q.id,
                current_step=1 if app_status == ApprovalStatus.PENDING_MANAGER else 2,
                status=app_status,
                blended_risk_score=Decimal(str(10.5 + (idx * 2.1))),
                created_at=now - timedelta(days=15 - idx),
            )
            session.add(req)
            session.flush()

            step1 = ApprovalStep(
                approval_request_id=req.id,
                step_number=1,
                approver_role=Role.SALES_MANAGER,
                decision="APPROVED" if is_approved else ("REJECTED" if is_rejected else None),
                decided_by=managers[idx % len(managers)].id if not is_approved and not is_rejected else managers[idx % len(managers)].id,
                decided_at=now - timedelta(days=14 - idx) if is_approved or is_rejected else None,
                reason="Standard commercial margin threshold met." if is_approved else ("Discount ceiling exceeded." if is_rejected else "Awaiting manager signoff"),
            )
            session.add(step1)

            session.add(AuditLogEntry(
                user_id=managers[idx % len(managers)].id,
                action="SUBMIT_FOR_APPROVAL",
                entity_type="Quotation",
                entity_id=q.id,
                reason="Commercial deal discount routing rule triggered.",
                before_snapshot={"status": "Draft"},
                after_snapshot={"status": "Pending Approval"},
                timestamp=now - timedelta(days=15 - idx),
            ))
        session.flush()

        # ----------------------------------------------------
        # 10. INVOICES, PAYMENTS & CREDIT NOTES (16 Invoices)
        # ----------------------------------------------------
        print("Seeding Invoices, Payments & Credit Notes...")
        invoices = []
        for idx, q in enumerate(quotations[:16]):
            inv_total = sum(l.line_total for l in q.lines)
            inv_status = InvoiceStatus.PAID if idx % 3 == 0 else (InvoiceStatus.PARTIALLY_PAID if idx % 3 == 1 else InvoiceStatus.UNPAID)
            inv = Invoice(
                quotation_id=q.id,
                amount=inv_total,
                status=inv_status,
                created_at=now - timedelta(days=12 - idx),
            )
            session.add(inv)
            invoices.append(inv)
        session.flush()

        for idx, inv in enumerate(invoices):
            if inv.status in [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID]:
                p_amount = inv.amount if inv.status == InvoiceStatus.PAID else (inv.amount * Decimal("0.50")).quantize(Decimal("0.01"))
                session.add(Payment(
                    invoice_id=inv.id,
                    amount=p_amount,
                    paid_at=now - timedelta(days=10 - idx),
                    reference=f"WIRE-DIRECT-{1000 + idx}",
                ))
            if idx % 4 == 0:
                session.add(CreditNote(
                    invoice_id=inv.id,
                    amount=Decimal("150.00"),
                    reason="Early payment incentive discount credit.",
                    created_at=now - timedelta(days=9 - idx),
                ))
        session.flush()

        # ----------------------------------------------------
        # 11. BILLING SCHEDULES (15 Records)
        # ----------------------------------------------------
        print("Seeding Billing Schedules...")
        sched_idx = 0
        for line in quotation_lines:
            if line.plan_id:
                session.add(BillingSchedule(
                    quotation_line_id=line.id,
                    plan_id=line.plan_id,
                    billing_date=today + timedelta(days=30 * (sched_idx + 1)),
                    amount=line.line_total,
                    status=ScheduleStatus.BILLED if sched_idx % 2 == 0 else ScheduleStatus.SCHEDULED,
                ))
                sched_idx += 1
                if sched_idx >= 15:
                    break
        session.flush()

        # ----------------------------------------------------
        # 12. FULFILLMENT SPLITS & BACKORDERS (15 Splits)
        # ----------------------------------------------------
        print("Seeding Fulfillment Splits & Backorders...")
        for idx, q in enumerate(quotations[:15]):
            f_status = FulfillmentStatus.FULFILLED if q.status == QuotationStatus.FULFILLED else (
                FulfillmentStatus.PARTIALLY_FULFILLED if idx % 2 == 0 else FulfillmentStatus.SUGGESTED
            )
            split = FulfillmentSplit(
                quotation_id=q.id,
                status=f_status,
                created_at=now - timedelta(days=10 - idx),
            )
            session.add(split)
            session.flush()

            for line in q.lines:
                f_qty = int(line.quantity) if f_status == FulfillmentStatus.FULFILLED else (int(line.quantity // 2) if f_status == FulfillmentStatus.PARTIALLY_FULFILLED else 0)
                b_qty = int(line.quantity) - f_qty
                f_line = FulfillmentSplitLine(
                    fulfillment_split_id=split.id,
                    quotation_line_id=line.id,
                    warehouse_id=warehouses[idx % len(warehouses)].id,
                    quantity_fulfilled=f_qty,
                    quantity_backordered=b_qty,
                )
                session.add(f_line)
                session.flush()

                if b_qty > 0:
                    session.add(Backorder(
                        fulfillment_split_line_id=f_line.id,
                        quantity_remaining=b_qty,
                        status=BackorderStatus.OPEN if f_status != FulfillmentStatus.FULFILLED else BackorderStatus.CLOSED,
                        resolved_at=now if f_status == FulfillmentStatus.FULFILLED else None,
                    ))
        session.flush()

        # ----------------------------------------------------
        # 13. UPSELL ENGINE DATA
        # ----------------------------------------------------
        print("Seeding Upsell Pairing Rules & Config...")
        pairings = [
            (products[0].id, products[10].id, 0.92),  # Cloud Infra -> Support
            (products[0].id, products[3].id, 0.85),   # Cloud Infra -> API Gateway
            (products[1].id, products[7].id, 0.88),   # AI Engine -> Data Lake Appliance
            (products[1].id, products[4].id, 0.79),   # AI Engine -> Onboarding
            (products[2].id, products[12].id, 0.95),  # SOC Defense -> Security Audit
            (products[6].id, products[11].id, 0.82),  # Business Platform -> ERP Accelerator
            (products[6].id, products[13].id, 0.77),  # Business Platform -> BI Dashboard
            (products[8].id, products[14].id, 0.89),  # Edge Gateway -> Load Balancer
            (products[9].id, products[3].id, 0.91),   # Dev API -> API Gateway
            (products[11].id, products[4].id, 0.84),  # ERP Accelerator -> Onboarding
        ]
        for base_p, sug_p, score in pairings:
            session.add(ProductPairingRule(base_product_id=base_p, suggested_product_id=sug_p, co_purchase_score=score))

        for idx, p in enumerate(products[:5]):
            session.add(ProductPromotion(
                product_id=p.id,
                is_promoted=True,
                promo_label=f"Q3 Strategic Booster - {p.category}",
                starts_at=now - timedelta(days=30),
                ends_at=now + timedelta(days=60),
            ))

        upsell_configs = [
            ("min_co_purchase_score", "0.70"),
            ("max_recommendations", "4"),
            ("boost_promoted_products", "true"),
            ("discount_boost_factor", "1.15"),
        ]
        for k, v in upsell_configs:
            session.add(UpsellConfig(key=k, value=v))
        session.flush()

        # ----------------------------------------------------
        # 14. PORTAL ACCESS & NEGOTIATION THREADS (15 Records)
        # ----------------------------------------------------
        print("Seeding Portal Access & Negotiations...")
        for idx, q in enumerate(quotations[:15]):
            session.add(PortalAccess(
                quotation_id=q.id,
                customer_id=q.customer_id,
                access_token_hash=f"token_hash_secure_portal_{q.id}_{idx}",
                expires_at=now + timedelta(days=30),
                created_at=now - timedelta(days=5),
            ))

            n_thread = NegotiationThread(
                quotation_id=q.id,
                status=NegotiationStatus.OPEN if q.status == QuotationStatus.UNDER_NEGOTIATION else NegotiationStatus.RESOLVED,
                opened_at=now - timedelta(days=7 - idx if idx < 7 else 1),
                closed_at=now if q.status != QuotationStatus.UNDER_NEGOTIATION else None,
            )
            session.add(n_thread)
            session.flush()

            msg1 = NegotiationMessage(
                thread_id=n_thread.id,
                quotation_line_id=q.lines[0].id if q.lines else None,
                author_type=NegotiationAuthorType.CUSTOMER,
                author_id=q.customer_id,
                message_type=NegotiationMessageType.COUNTER_DISCOUNT,
                content="Requesting additional 5% discount for multi-year enterprise volume.",
                proposed_discount_percent=Decimal("15.00"),
                created_at=now - timedelta(days=6),
            )
            msg2 = NegotiationMessage(
                thread_id=n_thread.id,
                quotation_line_id=q.lines[0].id if q.lines else None,
                author_type=NegotiationAuthorType.REP,
                author_id=q.rep_id,
                message_type=NegotiationMessageType.COMMENT,
                content="Submitted requested discount to Regional Manager for signoff.",
                proposed_discount_percent=Decimal("12.50"),
                created_at=now - timedelta(days=5),
            )
            session.add(msg1)
            session.add(msg2)
        session.flush()

        # ----------------------------------------------------
        # 15. DEAL HEALTH FLAGS (15 Records)
        # ----------------------------------------------------
        print("Seeding Deal Health Flags...")
        for idx, q in enumerate(quotations[:8]):
            session.add(StalledDealFlag(
                quotation_id=q.id,
                flagged_at=now - timedelta(days=idx + 2),
                days_inactive=14 + (idx * 3),
            ))

        for idx, q in enumerate(quotations[8:15]):
            session.add(DiscountAnomalyFlag(
                quotation_id=q.id,
                rep_id=q.rep_id,
                discount_given=Decimal(str(22.50 + idx)),
                rep_average_discount=Decimal("11.20"),
                flagged_at=now - timedelta(days=idx + 1),
            ))
        session.flush()

        # ----------------------------------------------------
        # 16. AUDIT LOGS (20 Records)
        # ----------------------------------------------------
        print("Seeding Generic Audit Logs...")
        audit_actions = [
            ("USER_LOGIN", "User", "User authenticated from IP 192.168.1.10"),
            ("CREATE_QUOTATION", "Quotation", "Draft quotation generated with 2 line items"),
            ("SUBMIT_APPROVAL", "ApprovalRequest", "Quotation submitted for multi-step approval routing"),
            ("APPROVE_QUOTATION", "ApprovalStep", "Manager approved discount override"),
            ("GENERATE_INVOICE", "Invoice", "Commercial invoice generated upon deal confirmation"),
            ("RECORD_PAYMENT", "Payment", "Payment recorded via Wire Transfer reconciliation"),
            ("PORTAL_LOGIN", "Customer", "Customer accessed portal quote summary"),
        ]
        for idx in range(20):
            u = users[idx % len(users)]
            act, ent, reas = audit_actions[idx % len(audit_actions)]
            session.add(AuditLog(
                entity_type=ent,
                entity_id=(idx % 15) + 1,
                user_id=u.id,
                action=act,
                reason=reas,
                timestamp=now - timedelta(hours=idx * 6),
            ))

        session.commit()
        print("Database comprehensive seeding completed successfully!")
    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_all()
