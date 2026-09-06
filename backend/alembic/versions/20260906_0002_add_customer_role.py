"""Add the customer role to the shared user enum."""
from alembic import op

revision = "20260906_0002"
down_revision = "20260906_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'Customer'")


def downgrade() -> None:
    # PostgreSQL enum values cannot be removed safely in place.
    pass
