"""Track whether a subscription plan is active."""
from alembic import op
import sqlalchemy as sa

revision = "20260906_0001"
down_revision = "38193b41fbf4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("subscription_plans", sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False))
    op.create_index("ix_subscription_plans_is_active", "subscription_plans", ["is_active"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_subscription_plans_is_active", table_name="subscription_plans")
    op.drop_column("subscription_plans", "is_active")