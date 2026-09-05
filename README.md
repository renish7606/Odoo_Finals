# DealFlow

DealFlow is a FastAPI backend with PostgreSQL persistence.

## Run locally

1. Start PostgreSQL:

   ```powershell
   docker compose up -d db
   ```

2. Create and activate a virtual environment from `backend/`, then install dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. Start the API from `backend/`:

   ```powershell
   uvicorn app.main:app --reload
   ```

The API is available at `http://localhost:8000`; interactive docs are at `/docs` and the health check is `/health`.

The domain modules are scaffolded and ready for feature implementation. Add Alembic revisions under `backend/alembic/versions/` as models are introduced.
