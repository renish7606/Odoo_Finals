"""Group B: warehouse and fulfillment tables.

Revision ID: 20260905_0003
Revises: 20260905_0002
"""

from alembic import op
import sqlalchemy as sa

revision = "20260905_0003"
down_revision = "20260905_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create warehouse, stock, fulfillment, and backorder tables."""
    fulfillment_status_enum = sa.Enum(
        "suggested", "accepted", "manually_overridden", "partially_fulfilled", "fulfilled",
        name="fulfillment_status_enum",
    )
    backorder_status_enum = sa.Enum(
        "open", "consolidation_ready", "consolidated", "closed",
        name="backorder_status_enum",
    )

    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("shipping_cost_weight", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("name", name="uq_warehouses_name"),
    )

    op.create_table(
        "warehouse_stock",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity_on_hand", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reserved_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("replenishment_threshold", sa.Integer(), nullable=True),
        sa.Column("replenishment_lead_time_days", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.UniqueConstraint("warehouse_id", "product_id", name="uq_warehouse_product"),
    )
    op.create_index("ix_warehouse_stock_warehouse_id", "warehouse_stock", ["warehouse_id"])
    op.create_index("ix_warehouse_stock_product_id", "warehouse_stock", ["product_id"])

    op.create_table(
        "fulfillment_splits",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("quotation_id", sa.Integer(), nullable=False),
        sa.Column("status", fulfillment_status_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["quotation_id"], ["quotations.id"]),
    )
    op.create_index("ix_fulfillment_splits_quotation_id", "fulfillment_splits", ["quotation_id"])

    op.create_table(
        "fulfillment_split_lines",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("fulfillment_split_id", sa.Integer(), nullable=False),
        sa.Column("quotation_line_id", sa.Integer(), nullable=False),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("quantity_fulfilled", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("quantity_backordered", sa.Integer(), nullable=False, server_default="0"),
        sa.ForeignKeyConstraint(["fulfillment_split_id"], ["fulfillment_splits.id"]),
        sa.ForeignKeyConstraint(["quotation_line_id"], ["quotation_lines.id"]),
        # warehouse_id=0 means "backorder / no warehouse" — no FK constraint on purpose
    )
    op.create_index("ix_fulfillment_split_lines_fulfillment_split_id", "fulfillment_split_lines", ["fulfillment_split_id"])
    op.create_index("ix_fulfillment_split_lines_quotation_line_id", "fulfillment_split_lines", ["quotation_line_id"])
    op.create_index("ix_fulfillment_split_lines_warehouse_id", "fulfillment_split_lines", ["warehouse_id"])

    op.create_table(
        "backorders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("fulfillment_split_line_id", sa.Integer(), nullable=False),
        sa.Column("quantity_remaining", sa.Integer(), nullable=False),
        sa.Column("status", backorder_status_enum, nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["fulfillment_split_line_id"], ["fulfillment_split_lines.id"]),
    )
    op.create_index("ix_backorders_fulfillment_split_line_id", "backorders", ["fulfillment_split_line_id"])


def downgrade() -> None:
    """Remove warehouse and fulfillment tables."""
    op.drop_table("backorders")
    op.drop_table("fulfillment_split_lines")
    op.drop_table("fulfillment_splits")
    op.drop_table("warehouse_stock")
    op.drop_table("warehouses")
    sa.Enum(name="fulfillment_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="backorder_status_enum").drop(op.get_bind(), checkfirst=True)
