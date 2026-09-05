"""Small role checks that future endpoint modules can reuse."""

from app.api.deps import require_role


# Re-export the dependency from its central API dependency module.
