"""Keep the declarative base separate so model imports stay cycle-free."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class shared by every SQLAlchemy model."""
