"""Seed safe example records for local development only."""

from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.customer import Customer, CustomerTier
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.user import User


def seed_data() -> None:
    """Add missing sample users, customers, and products without duplicates."""
    session = SessionLocal()
    try:
        sample_users = [
            ("admin@dealflow360.com", "Local Admin", Role.ADMIN),
            ("manager@dealflow360.com", "Local Sales Manager", Role.SALES_MANAGER),
            ("rep@dealflow360.com", "Local Sales Rep", Role.SALES_REP),
            ("finance@dealflow360.com", "Local Finance Ops", Role.FINANCE_OPS),
        ]
        for email, full_name, role in sample_users:
            if session.scalar(select(User).where(User.email == email)) is None:
                session.add(User(email=email, full_name=full_name, role=role, hashed_password=hash_password("ChangeMe123!")))

        sample_customers = [
            ("Bronze Buyer", "bronze@dealflow360.com", CustomerTier.BRONZE),
            ("Silver Buyer", "silver@dealflow360.com", CustomerTier.SILVER),
            ("Gold Buyer", "gold@dealflow360.com", CustomerTier.GOLD),
        ]
        for name, email, tier in sample_customers:
            if session.scalar(select(Customer).where(Customer.email == email)) is None:
                session.add(Customer(name=name, email=email, tier=tier))

        sample_products = [
            ("Starter Service", "Services", Decimal("150.00"), "month", Decimal("18.00")),
            ("Business Service", "Services", Decimal("500.00"), "month", Decimal("18.00")),
            ("Onboarding", "Professional Services", Decimal("1000.00"), "project", Decimal("18.00")),
        ]
        for name, category, price, unit, tax_rate in sample_products:
            if session.scalar(select(Product).where(Product.name == name)) is None:
                session.add(Product(name=name, category=category, base_price=price, unit=unit, tax_rate=tax_rate))

        session.flush()

        sample_quotations = [
            ("bronze@dealflow360.com", "rep@dealflow360.com", QuotationStatus.DRAFT, [("Starter Service", Decimal("2.00")), ("Onboarding", Decimal("1.00"))]),
            ("gold@dealflow360.com", "manager@dealflow360.com", QuotationStatus.CONFIRMED, [("Business Service", Decimal("3.00"))]),
        ]
        for customer_email, rep_email, status, line_items in sample_quotations:
            customer = session.scalar(select(Customer).where(Customer.email == customer_email))
            rep = session.scalar(select(User).where(User.email == rep_email))
            quotation = session.scalar(
                select(Quotation).where(
                    Quotation.customer_id == customer.id,
                    Quotation.rep_id == rep.id,
                    Quotation.status == status,
                )
            )
            if quotation is None:
                quotation = Quotation(customer_id=customer.id, rep_id=rep.id, status=status)
                session.add(quotation)
                session.flush()
                for product_name, quantity in line_items:
                    product = session.scalar(select(Product).where(Product.name == product_name))
                    line_total = product.base_price * quantity
                    session.add(
                        QuotationLine(
                            quotation_id=quotation.id,
                            product_id=product.id,
                            quantity=quantity,
                            unit_price=product.base_price,
                            discount_percent=Decimal("0.00"),
                            line_total=line_total,
                            category_snapshot=product.category,
                        )
                    )
        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    # Run with: python -m app.db.init_db
    seed_data()
