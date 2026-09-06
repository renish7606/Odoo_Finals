"""Create and check passwords and signed JWT tokens."""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

def hash_password(password: str) -> str:
    """Turn a plain password into a safe stored value."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plain password against its stored value."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, scope: str = "internal") -> str:
    """Create a short-lived token for one internal user or portal customer."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=(
            settings.portal_token_expire_minutes
            if scope.startswith("portal")
            else settings.access_token_expire_minutes
        )
    )
    return jwt.encode(
        {"sub": subject, "scope": scope, "exp": expires_at},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_token(token: str) -> dict:
    """Read a token and reject invalid or expired signatures."""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])


def token_is_valid(token: str) -> bool:
    """Return a simple result for callers that only need validation."""
    try:
        decode_token(token)
    except JWTError:
        return False
    return True
