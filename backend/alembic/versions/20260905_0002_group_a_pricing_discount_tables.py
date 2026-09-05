"""Add isolated Group A pricing, discount, and approval tables."""
from alembic import op
import sqlalchemy as sa

revision="20260905_0002"
down_revision="20260905_0001"
branch_labels=None
depends_on=None

def upgrade() -> None:
    """Create Group A tables and additive product fields."""
    op.add_column("products", sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.add_column("products", sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.add_column("products", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_table("variants",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("product_id",sa.Integer(),sa.ForeignKey("products.id"),nullable=False),sa.Column("attribute_name",sa.String(100),nullable=False),sa.Column("value",sa.String(100),nullable=False),sa.Column("extra_price",sa.Numeric(12,2),nullable=False,server_default="0"))
    op.create_table("price_lists",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("name",sa.String(255),nullable=False,unique=True),sa.Column("customer_tier",sa.String(20),nullable=False),sa.Column("currency",sa.String(3),nullable=False),sa.Column("effective_from",sa.Date(),nullable=False),sa.Column("effective_to",sa.Date(),nullable=True))
    op.create_table("price_list_entries",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("price_list_id",sa.Integer(),sa.ForeignKey("price_lists.id"),nullable=False),sa.Column("product_id",sa.Integer(),sa.ForeignKey("products.id"),nullable=False),sa.Column("variant_id",sa.Integer(),sa.ForeignKey("variants.id"),nullable=True),sa.Column("resolved_price",sa.Numeric(12,2),nullable=False))
    op.create_table("discount_tiers",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("customer_tier",sa.String(20),nullable=False,unique=True),sa.Column("max_discount_percent",sa.Numeric(5,2),nullable=False))
    op.create_table("category_discount_ceilings",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("category",sa.String(100),nullable=False,unique=True),sa.Column("max_discount_percent",sa.Numeric(5,2),nullable=False))
    op.create_table("approval_chain_configs",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("min_score",sa.Numeric(8,4),nullable=False),sa.Column("max_score",sa.Numeric(8,4),nullable=True),sa.Column("required_level",sa.Enum("MANAGER_ONLY","MANAGER_THEN_FINANCE",name="approval_level_enum"),nullable=False))
    op.create_table("approval_requests",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("quotation_id",sa.Integer(),sa.ForeignKey("quotations.id"),nullable=False,unique=True),sa.Column("current_step",sa.Integer(),nullable=False),sa.Column("status",sa.Enum("PENDING_MANAGER","PENDING_FINANCE","APPROVED","REJECTED","RETURNED",name="approval_status_enum"),nullable=False),sa.Column("blended_risk_score",sa.Numeric(8,4),nullable=False),sa.Column("created_at",sa.DateTime(timezone=True),server_default=sa.text("now()"),nullable=False))
    op.create_table("approval_steps",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("approval_request_id",sa.Integer(),sa.ForeignKey("approval_requests.id"),nullable=False),sa.Column("step_number",sa.Integer(),nullable=False),sa.Column("approver_role",sa.String(20),nullable=False),sa.Column("decision",sa.String(20)),sa.Column("decided_by",sa.Integer(),sa.ForeignKey("users.id")),sa.Column("decided_at",sa.DateTime(timezone=True)),sa.Column("reason",sa.Text()))
    op.create_table("approval_audit_logs",sa.Column("id",sa.Integer(),primary_key=True),sa.Column("user_id",sa.Integer(),sa.ForeignKey("users.id")),sa.Column("action",sa.String(100),nullable=False),sa.Column("entity_type",sa.String(100),nullable=False),sa.Column("entity_id",sa.Integer(),nullable=False),sa.Column("reason",sa.Text()),sa.Column("before_snapshot",sa.JSON()),sa.Column("after_snapshot",sa.JSON()),sa.Column("timestamp",sa.DateTime(timezone=True),server_default=sa.text("now()"),nullable=False))
def downgrade() -> None:
    """Remove only tables created by this Group A migration."""
    for name in ("approval_audit_logs","approval_steps","approval_requests","approval_chain_configs","category_discount_ceilings","discount_tiers","price_list_entries","price_lists","variants"): op.drop_table(name)
    op.drop_column("products","updated_at"); op.drop_column("products","created_at"); op.drop_column("products","is_active")
