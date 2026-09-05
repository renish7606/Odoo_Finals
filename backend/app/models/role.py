"""Define the fixed internal roles used by RBAC."""

from enum import Enum


class Role(str, Enum):
    """Roles shared by all internal DealFlow360 teams."""

    SALES_REP = "SalesRep"
    SALES_MANAGER = "SalesManager"
    FINANCE_OPS = "FinanceOps"
    ADMIN = "Admin"
