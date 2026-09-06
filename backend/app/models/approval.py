"""Store approval requests, steps, and immutable audit rows."""
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from sqlalchemy import DateTime, Enum as SqlEnum, ForeignKey, Integer, JSON, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base
from app.models.role import Role
class ApprovalStatus(str, Enum):
    """Approval request states."""
    PENDING_MANAGER="PENDING_MANAGER"; PENDING_FINANCE="PENDING_FINANCE"; APPROVED="APPROVED"; REJECTED="REJECTED"; RETURNED="RETURNED"
class ApprovalRequest(Base):
    """One current request per quotation."""
    __tablename__="approval_requests"
    id: Mapped[int]=mapped_column(primary_key=True)
    quotation_id: Mapped[int]=mapped_column(ForeignKey("quotations.id"),unique=True,index=True)
    current_step: Mapped[int]=mapped_column(Integer,default=1)
    status: Mapped[ApprovalStatus]=mapped_column(SqlEnum(ApprovalStatus,name="approval_status_enum"))
    blended_risk_score: Mapped[Decimal]=mapped_column(Numeric(8,4))
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
class ApprovalStep(Base):
    """One role decision in a request."""
    __tablename__="approval_steps"
    id: Mapped[int]=mapped_column(primary_key=True)
    approval_request_id: Mapped[int]=mapped_column(ForeignKey("approval_requests.id"),index=True)
    step_number: Mapped[int]=mapped_column(Integer)
    approver_role: Mapped[Role]=mapped_column(SqlEnum(Role,name="role_enum",create_type=False,values_callable=lambda x:[v.value for v in x]))
    decision: Mapped[Optional[str]]=mapped_column(String(20),nullable=True)
    decided_by: Mapped[Optional[int]]=mapped_column(ForeignKey("users.id"),nullable=True)
    decided_at: Mapped[Optional[datetime]]=mapped_column(DateTime(timezone=True),nullable=True)
    reason: Mapped[Optional[str]]=mapped_column(Text,nullable=True)
class AuditLogEntry(Base):
    """Append-only approval action evidence."""
    __tablename__="approval_audit_logs"
    id: Mapped[int]=mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]]=mapped_column(ForeignKey("users.id"),nullable=True)
    action: Mapped[str]=mapped_column(String(100))
    entity_type: Mapped[str]=mapped_column(String(100))
    entity_id: Mapped[int]=mapped_column()
    reason: Mapped[Optional[str]]=mapped_column(Text,nullable=True)
    before_snapshot: Mapped[Optional[dict]]=mapped_column(JSON,nullable=True)
    after_snapshot: Mapped[Optional[dict]]=mapped_column(JSON,nullable=True)
    timestamp: Mapped[datetime]=mapped_column(DateTime(timezone=True),server_default=func.now())
