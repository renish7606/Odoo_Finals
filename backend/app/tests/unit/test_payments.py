import pytest
from datetime import datetime
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.api import deps
from app.models.invoice import Invoice, InvoiceStatus, Payment, CreditNote
from app.models.user import User

client = TestClient(app)

mock_user = User(id=1, email="test@example.com", is_active=True)

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
        return self.result if isinstance(self.result, list) else [self.result]


class MockDB:
    def __init__(self, invoice):
        self.invoice = invoice

    def query(self, model):
        return MockQuery(self.invoice)

    def add(self, obj):
        if isinstance(obj, Payment):
            obj.id = 1
            obj.paid_at = datetime.utcnow()
            self.invoice.payments.append(obj)

    def flush(self):
        pass
        
    def refresh(self, obj):
        pass

    def commit(self):
        pass


def test_record_payment_partial(monkeypatch):
    invoice = Invoice(id=1, quotation_id=1, amount=Decimal("100.0"), status=InvoiceStatus.UNPAID)
    invoice.payments = []
    invoice.credit_notes = []

    def override_get_db():
        yield MockDB(invoice)

    app.dependency_overrides[deps.get_current_user] = override_get_current_user
    app.dependency_overrides[deps.get_db] = override_get_db

    response = client.post("/api/v1/payments/invoices/1/pay", json={"amount": 40.0, "reference": "TXN123"})
    assert response.status_code == 200
    assert invoice.status == InvoiceStatus.PARTIALLY_PAID


def test_record_payment_full_with_credit_note():
    invoice = Invoice(id=1, quotation_id=1, amount=Decimal("100.0"), status=InvoiceStatus.PARTIALLY_PAID)
    invoice.payments = [Payment(id=1, invoice_id=1, amount=Decimal("40.0"))]
    invoice.credit_notes = [CreditNote(id=1, invoice_id=1, amount=Decimal("10.0"))]

    def override_get_db():
        yield MockDB(invoice)

    app.dependency_overrides[deps.get_db] = override_get_db

    # Remaining is 100 - 40 - 10 = 50. Pay 50 to complete.
    response = client.post("/api/v1/payments/invoices/1/pay", json={"amount": 50.0})
    assert response.status_code == 200
    assert invoice.status == InvoiceStatus.PAID
