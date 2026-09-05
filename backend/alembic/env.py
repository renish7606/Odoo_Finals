from app.core.config import settings

# Alembic can import this settings object when migrations are added.
target_metadata = None


def get_database_url() -> str:
    return settings.database_url
