import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api import deps
from app.models.role import Role
from app.models.user import User

client = TestClient(app)

mock_user = User(id=1, email="sales@example.com", role=Role.SALES_REP, is_active=True)

def override_get_current_user():
    return mock_user


class MockQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result
        
    def all(self):
        return self.result if isinstance(self.result, list) else []

class MockDB:
    def query(self, model):
        return MockQuery([])

    def scalar(self, statement):
        return None

    def add(self, obj):
        pass

    def commit(self):
        pass

def override_get_db():
    yield MockDB()

@pytest.fixture(autouse=True)
def isolated_dependencies():
    """Install mocks only while each deal-health test is running."""
    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[deps.get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


def test_stalled_deals_endpoint(monkeypatch):
    # Mock the detection logic
    def mock_detect(*args): return 0
    monkeypatch.setattr("app.services.deal_health_service.detect_stalled_deals", mock_detect)

    response = client.get("/api/v1/deal_health/stalled")
    assert response.status_code == 200

def test_reports_endpoint():
    response = client.get("/api/v1/reports/quotations")
    assert response.status_code == 200
