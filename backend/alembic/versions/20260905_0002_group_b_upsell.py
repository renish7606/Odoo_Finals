"""Group B: upsell tables.

Revision ID: 20260905_0002
Revises: 20260905_0001
"""

from alembic import op
import sqlalchemy as sa

revision = "20260905_0002"
down_revision = "20260905_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create upsell tables: product_pairing_rules, product_promotions, upsell_config."""
    op.create_table(
        "product_pairing_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("base_product_id", sa.Integer(), nullable=False),
        sa.Column("suggested_product_id", sa.Integer(), nullable=False),
        sa.Column("co_purchase_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["base_product_id"], ["products.id"]),
        sa.ForeignKeyConstraint(["suggested_product_id"], ["products.id"]),
    )
    op.create_index("ix_product_pairing_rules_base_product_id", "product_pairing_rules", ["base_product_id"])
    op.create_index("ix_product_pairing_rules_suggested_product_id", "product_pairing_rules", ["suggested_product_id"])

    op.create_table(
        "product_promotions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("is_promoted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("promo_label", sa.String(255), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.UniqueConstraint("product_id", name="uq_product_promotions_product_id"),
    )

    op.create_table(
        "upsell_config",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(100), nullable=False),
        sa.Column("value", sa.String(255), nullable=False),
        sa.UniqueConstraint("key", name="uq_upsell_config_key"),
    )

    # Seed default config
    op.execute("INSERT INTO upsell_config (key, value) VALUES ('minimum_margin_threshold', '0')")


def downgrade() -> None:
    """Remove upsell tables."""
    op.drop_table("upsell_config")
    op.drop_table("product_promotions")
    op.drop_table("product_pairing_rules")
