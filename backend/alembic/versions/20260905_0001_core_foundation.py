"""Create the shared DealFlow360 foundation tables."""

from alembic import op
import sqlalchemy as sa


# Alembic identifies this first shared migration by this revision id.
revision = "20260905_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create only the tables owned by the core foundation."""
    role_enum = sa.Enum("SalesRep", "SalesManager", "FinanceOps", "Admin", name="role_enum")
    customer_tier_enum = sa.Enum("Bronze", "Silver", "Gold", name="customer_tier_enum")
    quotation_status_enum = sa.Enum("Draft", "Pending Approval", "Approved", "Sent", "Under Negotiation", "Confirmed", "Fulfilled", "Rejected", name="quotation_status_enum")
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("email", sa.String(255), nullable=False), sa.Column("hashed_password", sa.String(255), nullable=False), sa.Column("full_name", sa.String(255), nullable=False), sa.Column("role", role_enum, nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("email"))
    op.create_index("ix_users_email", "users", ["email"], unique=False)
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_table("customers", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("email", sa.String(255), nullable=False), sa.Column("tier", customer_tier_enum, nullable=False), sa.Column("portal_password_hash", sa.String(255), nullable=True), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("email"))
    op.create_index("ix_customers_email", "customers", ["email"], unique=False)
    op.create_table("products", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("category", sa.String(100), nullable=False), sa.Column("base_price", sa.Numeric(12, 2), nullable=False), sa.Column("unit", sa.String(50), nullable=False), sa.Column("tax_rate", sa.Numeric(5, 2), nullable=False), sa.Column("description", sa.Text(), nullable=True), sa.UniqueConstraint("name"))
    op.create_index("ix_products_category", "products", ["category"], unique=False)
    op.create_table("quotations", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("customer_id", sa.Integer(), nullable=False), sa.Column("rep_id", sa.Integer(), nullable=False), sa.Column("status", quotation_status_enum, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.ForeignKeyConstraint(["customer_id"], ["customers.id"]), sa.ForeignKeyConstraint(["rep_id"], ["users.id"]))
    op.create_index("ix_quotations_customer_id", "quotations", ["customer_id"], unique=False)
    op.create_index("ix_quotations_rep_id", "quotations", ["rep_id"], unique=False)
    op.create_table("quotation_lines", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("quotation_id", sa.Integer(), nullable=False), sa.Column("product_id", sa.Integer(), nullable=False), sa.Column("quantity", sa.Numeric(12, 2), nullable=False), sa.Column("unit_price", sa.Numeric(12, 2), nullable=False), sa.Column("discount_percent", sa.Numeric(5, 2), nullable=False), sa.Column("line_total", sa.Numeric(12, 2), nullable=False), sa.Column("category_snapshot", sa.String(100), nullable=True), sa.ForeignKeyConstraint(["product_id"], ["products.id"]), sa.ForeignKeyConstraint(["quotation_id"], ["quotations.id"]))
    op.create_index("ix_quotation_lines_product_id", "quotation_lines", ["product_id"], unique=False)
    op.create_index("ix_quotation_lines_quotation_id", "quotation_lines", ["quotation_id"], unique=False)
    op.create_table("audit_logs", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("entity_type", sa.String(100), nullable=False), sa.Column("entity_id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=True), sa.Column("action", sa.String(100), nullable=False), sa.Column("reason", sa.Text(), nullable=True), sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.ForeignKeyConstraint(["user_id"], ["users.id"]))
    op.create_index("ix_audit_logs_entity_id", "audit_logs", ["entity_id"], unique=False)
    op.create_index("ix_audit_logs_entity_type", "audit_logs", ["entity_type"], unique=False)
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    """Remove only tables made by this first migration."""
    op.drop_table("audit_logs")
    op.drop_table("quotation_lines")
    op.drop_table("quotations")
    op.drop_table("products")
    op.drop_table("customers")
    op.drop_table("users")
    sa.Enum(name="quotation_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="customer_tier_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="role_enum").drop(op.get_bind(), checkfirst=True)
