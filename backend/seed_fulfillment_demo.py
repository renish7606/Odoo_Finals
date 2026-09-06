"""Add an idempotent fulfillment demo order and warehouse stock to the local database."""
from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.customer import Customer
from app.models.product import Product
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.warehouse_stock import WarehouseStock


def seed_fulfillment_demo() -> int:
    db = SessionLocal()
    try:
        customer = db.scalars(select(Customer).order_by(Customer.id)).first()
        user = db.scalars(select(User).order_by(User.id)).first()
        products = db.scalars(select(Product).order_by(Product.id).limit(2)).all()
        if not customer or not user or len(products) < 2:
            raise RuntimeError("Seed users, customers, and at least two products before running this script.")

        warehouses = []
        for name, location, weight in (
            ("Equinix NY4 North America Hub", "Secaucus, NJ", 1.0),
            ("Frankfurt FRA1 European Gateway", "Frankfurt, DE", 1.15),
        ):
            warehouse = db.scalar(select(Warehouse).where(Warehouse.name == name))
            if warehouse is None:
                warehouse = Warehouse(name=name, location=location, shipping_cost_weight=weight)
                db.add(warehouse)
                db.flush()
            warehouses.append(warehouse)

        for warehouse in warehouses:
            for product in products:
                stock = db.scalar(select(WarehouseStock).where(
                    WarehouseStock.warehouse_id == warehouse.id,
                    WarehouseStock.product_id == product.id,
                ))
                if stock is None:
                    db.add(WarehouseStock(
                        warehouse_id=warehouse.id,
                        product_id=product.id,
                        quantity_on_hand=500,
                        reserved_quantity=0,
                        replenishment_threshold=50,
                        replenishment_lead_time_days=7,
                    ))

        reference = "FULFILLMENT-DEMO-001"
        quotation = db.scalar(select(Quotation).where(Quotation.id == 1))
        if quotation is None or not quotation.lines:
            quotation = Quotation(customer_id=customer.id, rep_id=user.id, status=QuotationStatus.CONFIRMED)
            db.add(quotation)
            db.flush()
            for product, quantity in zip(products, (12, 7)):
                price = Decimal(product.base_price)
                qty = Decimal(quantity)
                db.add(QuotationLine(
                    quotation_id=quotation.id,
                    product_id=product.id,
                    quantity=qty,
                    unit_price=price,
                    discount_percent=Decimal("0"),
                    line_total=price * qty,
                    category_snapshot=product.category,
                ))
        db.commit()
        return quotation.id
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Fulfillment demo quotation ready: {seed_fulfillment_demo()}")
