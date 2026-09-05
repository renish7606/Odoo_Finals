"""Seed safe example records for local development only."""

from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.customer import Customer, CustomerTier
from app.models.product import Product
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
        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    # Run with: python -m app.db.init_db
    seed_data()
