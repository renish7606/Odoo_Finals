import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.api import deps
from app.models.customer import Customer
from app.models.quotation import Quotation, QuotationLine, QuotationStatus
from app.models.portal import PortalAccess
from app.models.negotiation import NegotiationThread, NegotiationMessage, NegotiationStatus

client = TestClient(app)

# Mocked user and customer
mock_customer = Customer(id=1, email="test@example.com")


def override_require_portal_scope():
    return mock_customer


app.dependency_overrides[deps.require_portal_scope] = override_require_portal_scope


class MockQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result


class MockDB:
    def __init__(self, quotation=None, access=None, thread=None):
        self.quotation = quotation
        self.access = access
        self.thread = thread
        self.added = []
        self.committed = False

    def query(self, model):
        if model == PortalAccess:
            return MockQuery(self.access)
        if model == Quotation:
            return MockQuery(self.quotation)
        if model == NegotiationThread:
            return MockQuery(self.thread)
        return MockQuery(None)

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.committed = True

    def refresh(self, obj):
        if not hasattr(obj, "id") or obj.id is None:
            obj.id = 1


def test_portal_access_rejected_without_row():
    # Provide a DB session with no PortalAccess
    def override_get_db():
        yield MockDB(access=None)

    app.dependency_overrides[deps.get_db] = override_get_db

    response = client.get("/api/v1/portal/quotations/1")
    assert response.status_code == 403
    assert response.json()["detail"] == "No portal access for this quotation"


def test_portal_confirm_routes_approval(monkeypatch):
    # Setup data
    line = QuotationLine(id=10, quantity=1, unit_price=100, discount_percent=20.0, line_total=80)
    quotation = Quotation(id=1, customer_id=1, rep_id=1, status=QuotationStatus.UNDER_NEGOTIATION)
    quotation.lines = [line]

    access = PortalAccess(id=1, quotation_id=1, customer_id=1, access_token_hash="hash")
    thread = NegotiationThread(id=1, quotation_id=1, status=NegotiationStatus.OPEN)
    thread.messages = []

    mock_db = MockDB(quotation=quotation, access=access, thread=thread)

    def override_get_db():
        yield mock_db

    app.dependency_overrides[deps.get_db] = override_get_db

    routed = False
    def mock_route_quotation(q_id):
        nonlocal routed
        routed = True

    # Patch the route_quotation function in the portal endpoint
    monkeypatch.setattr("app.api.v1.endpoints.portal.route_quotation", mock_route_quotation)

    response = client.post("/api/v1/portal/quotations/1/confirm")
    assert response.status_code == 200
    assert response.json()["routed_for_approval"] is True
    assert routed is True
    assert quotation.status == QuotationStatus.PENDING_APPROVAL
