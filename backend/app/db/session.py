"""Create database sessions for API requests and scripts."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Pool checks help recover cleanly after a database restart.
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """Open one database session and always close it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
