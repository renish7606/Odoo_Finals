"""Share database and authentication dependencies between endpoint modules."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.customer import Customer
from app.models.user import User

# This reads a standard Bearer token from the Authorization header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def _read_token(token: str) -> dict:
    """Turn invalid tokens into one clear 401 response."""
    try:
        return decode_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Load the signed-in internal user and reject portal tokens."""
    payload = _read_token(token)
    if payload.get("scope") != "internal":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Internal token required")
    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is unavailable")
    return user


def get_optional_current_user(token: str | None = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)) -> User | None:
    """Load an internal user when a request includes a valid internal token."""
    if token is None:
        return None
    return get_current_user(token, db)


def require_portal_scope(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Customer:
    """Load a portal customer and reject all internal tokens."""
    payload = _read_token(token)
    if payload.get("scope") != "portal":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Portal token required")
    customer = db.get(Customer, int(payload["sub"]))
    if customer is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer is unavailable")
    return customer


def require_role(*roles: str):
    """Allow an endpoint only for one of the named internal roles."""
    def check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This role is not allowed to use this endpoint")
        return current_user

    return check_role
