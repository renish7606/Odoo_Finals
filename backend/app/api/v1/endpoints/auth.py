from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_current_user, require_portal_scope
from app.core.config import settings
from app.core.security import create_access_token, decode_token, hash_password, verify_password
from app.db.session import get_db
from app.models.customer import Customer
from app.models.role import Role
from app.models.user import User

# This router is found automatically by app.api.v1.api.
router = APIRouter(prefix="/auth", tags=["authentication"])


class SignupRequest(BaseModel):
    """Accept the minimum data for an internal user account."""

    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=255)
    role: Role = Role.SALES_REP


class LoginRequest(BaseModel):
    """Accept normal internal login details."""

    email: EmailStr
    password: str


class MagicLinkRequest(BaseModel):
    """Ask for a short customer-portal sign-in link."""

    email: EmailStr


class PortalLoginRequest(BaseModel):
    """Accept either a magic link token or customer password login."""

    magic_token: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


def user_profile(user: User) -> dict:
    """Return a small safe profile without the password hash."""
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role.value, "is_active": user.is_active}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db), requester: Optional[User] = Depends(get_optional_current_user)) -> dict:
    """Create an internal account; only an Admin can create another Admin."""
    if payload.role is Role.ADMIN and (requester is None or requester.role is not Role.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only an Admin can create an Admin user")
    if db.scalar(select(User).where(User.email == payload.email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    user = User(email=payload.email, full_name=payload.full_name, role=payload.role, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_profile(user)


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)) -> dict:
    """Accept JSON or Swagger form login and return an internal token."""
    if request.headers.get("content-type", "").startswith("application/x-www-form-urlencoded"):
        form = await request.form()
        email, password = form.get("username"), form.get("password")
    else:
        payload = LoginRequest.model_validate(await request.json())
        email, password = payload.email, payload.password
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not user.is_active or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    return {"access_token": create_access_token(str(user.id)), "token_type": "bearer"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    """Return the currently signed-in internal user's safe profile."""
    return user_profile(current_user)


@router.post("/portal/magic-link")
def create_magic_link(payload: MagicLinkRequest, db: Session = Depends(get_db)) -> dict:
    """Create a short-lived portal URL; email delivery comes later."""
    customer = db.scalar(select(Customer).where(Customer.email == payload.email))
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer email was not found")
    magic_token = create_access_token(str(customer.id), scope="portal_magic")
    return {"magic_link": f"{settings.portal_magic_link_base_url}/api/v1/auth/portal/login?token={magic_token}", "token": magic_token}


@router.post("/portal/login")
def portal_login(payload: PortalLoginRequest, db: Session = Depends(get_db)) -> dict:
    """Exchange a magic token or customer password for a portal-only token."""
    customer: Optional[Customer] = None
    if payload.magic_token:
        try:
            token_data = decode_token(payload.magic_token)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired magic link") from exc
        if token_data.get("scope") != "portal_magic":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Magic link token required")
        customer = db.get(Customer, int(token_data["sub"]))
    elif payload.email and payload.password:
        customer = db.scalar(select(Customer).where(Customer.email == payload.email))
        if customer is None or customer.portal_password_hash is None or not verify_password(payload.password, customer.portal_password_hash):
            customer = None
    else:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Provide a magic token or email and password")
    if customer is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Portal login failed")
    return {"access_token": create_access_token(str(customer.id), scope="portal"), "token_type": "bearer", "scope": "portal"}


@router.get("/portal/me")
def portal_me(customer: Customer = Depends(require_portal_scope)) -> dict:
    """Provide a small portal-only route that proves scope separation."""
    return {"id": customer.id, "email": customer.email, "name": customer.name}
