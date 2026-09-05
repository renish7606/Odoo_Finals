from fastapi.testclient import TestClient

from app import main
from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_database_health_check_returns_service_unavailable_when_database_is_down(
    monkeypatch,
) -> None:
    def unavailable_connect():
        raise main.SQLAlchemyError("unavailable")

    monkeypatch.setattr(main.engine, "connect", unavailable_connect)

    response = client.get("/health/database")

    assert response.status_code == 503
    assert response.json() == {"detail": "Database connection unavailable"}
