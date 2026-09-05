"""Expose SQLAlchemy metadata and import every core model for Alembic."""

from app.db.base_class import Base


# These imports register tables before Alembic reads Base.metadata.
from app.models.audit_log import AuditLog  # noqa: E402,F401
from app.models.customer import Customer  # noqa: E402,F401
from app.models.product import Product  # noqa: E402,F401
from app.models.quotation import Quotation, QuotationLine  # noqa: E402,F401
from app.models.user import User  # noqa: E402,F401

# Group B models — upsell, warehouse, fulfillment
from app.models.upsell import ProductPairingRule, ProductPromotion, UpsellConfig  # noqa: E402,F401
from app.models.warehouse import Warehouse  # noqa: E402,F401
from app.models.warehouse_stock import WarehouseStock  # noqa: E402,F401
from app.models.fulfillment import FulfillmentSplit, FulfillmentSplitLine, Backorder  # noqa: E402,F401
