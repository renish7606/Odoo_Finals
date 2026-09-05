"""Provide a lazy Redis client for future cache and session features."""

from redis import Redis

from app.core.config import settings


def get_redis() -> Redis:
    """Return a Redis client without connecting until it is first used."""
    return Redis.from_url(settings.redis_url, decode_responses=True)
