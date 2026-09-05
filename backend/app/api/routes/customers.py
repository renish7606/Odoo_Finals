"""Customer CRUD routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.customer import Customer
from app.models.user import User

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("")
def list_customers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """List all customers."""
    rows = db.scalars(select(Customer).order_by(Customer.id.asc())).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "tier": c.tier.value if hasattr(c.tier, "value") else str(c.tier) if c.tier else "Bronze",
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in rows
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new customer."""
    tier_val = payload.get("tier", "Bronze")
    from app.models.customer import CustomerTier
    try:
        tier_enum = CustomerTier(tier_val)
    except ValueError:
        tier_enum = CustomerTier.BRONZE
    customer = Customer(
        name=payload.get("name", "New Customer"),
        email=payload.get("email", ""),
        tier=tier_enum,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "tier": customer.tier.value if hasattr(customer.tier, "value") else str(customer.tier),
    }


@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get a single customer."""
    c = db.get(Customer, customer_id)
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "tier": c.tier.value if hasattr(c.tier, "value") else str(c.tier) if c.tier else "Bronze",
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }

