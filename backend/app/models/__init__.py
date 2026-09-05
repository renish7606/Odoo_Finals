"""Load core models together so SQLAlchemy relationships can resolve."""

# These imports make string relationship names available in scripts and endpoints.
from app.models.audit_log import AuditLog
from app.models.customer import Customer, CustomerTier
from app.models.invoice import CreditNote, Invoice, InvoiceStatus, Payment
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

__all__ = [
    "AuditLog",
    "BillingSchedule",
    "CancellationRule",
    "CreditNote",
    "Customer",
    "CustomerTier",
    "Invoice",
    "InvoiceStatus",
    "Payment",
    "Product",
    "ProrationRule",
    "Quotation",
    "QuotationLine",
    "QuotationStatus",
    "RefundType",
    "Role",
    "ScheduleStatus",
    "SubscriptionCadence",
    "SubscriptionPlan",
    "User",
]
