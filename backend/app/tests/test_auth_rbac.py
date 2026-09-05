"""Test the shared login, role, and portal token boundaries."""

from fastapi.testclient import TestClient

from app.main import app

# These tests use the local seed records created by app.db.init_db.
client = TestClient(app)


def login(email: str, password: str = "ChangeMe123!") -> str:
    """Get one internal token for a seeded local user."""
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_internal_login_and_profile() -> None:
    """A valid seeded internal user can see their own profile."""
    token = login("admin@dealflow360.com")
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["role"] == "Admin"


def test_signup_cannot_create_admin_without_admin_token() -> None:
    """Public signup may not create the most powerful role."""
    response = client.post("/api/v1/auth/signup", json={"email": "blocked-admin@dealflow360.com", "password": "LongPassword123!", "full_name": "Blocked Admin", "role": "Admin"})
    assert response.status_code == 403


def test_portal_token_is_rejected_by_internal_route() -> None:
    """Portal scope must not access the internal profile endpoint."""
    magic_response = client.post("/api/v1/auth/portal/magic-link", json={"email": "bronze@dealflow360.com"})
    assert magic_response.status_code == 200
    portal_response = client.post("/api/v1/auth/portal/login", json={"magic_token": magic_response.json()["token"]})
    assert portal_response.status_code == 200
    portal_token = portal_response.json()["access_token"]
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {portal_token}"})
    assert response.status_code == 403


def test_internal_token_is_rejected_by_portal_dependency() -> None:
    """An internal token must not access the portal-only test route."""
    token = login("admin@dealflow360.com")
    response = client.get("/api/v1/auth/portal/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
