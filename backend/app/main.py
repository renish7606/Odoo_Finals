"""Start the DealFlow360 shared backend foundation."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine

# The main app only wires shared infrastructure, never domain business logic.
app = FastAPI(title=settings.app_name, version="1.0.0")

# CORS — allow the Vite dev server and any local frontend to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Confirm that the web application is running."""
    return {"status": "ok"}


@app.get("/health/database", tags=["system"])
def database_health_check() -> dict[str, str]:
    """Confirm that the configured database accepts a simple query."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database connection unavailable") from exc
    return {"status": "ok"}
