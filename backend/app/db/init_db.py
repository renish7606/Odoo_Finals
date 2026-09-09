"""Seed safe example records for local development only."""

from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base_class import Base
from app.db.session import SessionLocal, engine
from app.models.customer import Customer, CustomerTier
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.role import Role
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock


from app.db.seed_comprehensive import seed_all


def seed_data() -> None:
    """Run comprehensive database seeder."""
    seed_all()


if __name__ == "__main__":
    # Run with: python -m app.db.init_db
    seed_data()

