# Group B — NOTES.md

## Foundation Interfaces (discovered)

### Project Structure
- Root: `backend/app/` contains all application code
- Router auto-discovery: `app/api/v1/api.py` → `build_api_router()` iterates `app.api.v1.endpoints.*`, includes any `router = APIRouter(...)` — no shared file edit needed
- DB engine: **sync** (`sqlalchemy.orm.Session`), NOT async

### Auth & RBAC
- `app/api/deps.py::get_current_user(token, db) -> User` — rejects portal tokens (scope != "internal") with 403
- `app/api/deps.py::require_role(*roles)` — checks `current_user.role.value in roles`, internally calls `get_current_user`
- `app/api/deps.py::require_portal_scope(token, db) -> Customer` — loads portal customer
- `app/api/deps.py::DbSession = Annotated[Session, Depends(get_db)]`
- Portal tokens: `scope: "portal"`, magic link tokens: `scope: "portal_magic"`, internal tokens: `scope: "internal"`
- Roles: `SalesRep`, `SalesManager`, `FinanceOps`, `Admin` (in `app/models/role.py::Role`)

### Quotation Domain
- `app/models/quotation.py::Quotation` — id, customer_id (FK users), rep_id (FK users), status (QuotationStatus enum), created_at, updated_at
- `app/models/quotation.py::QuotationLine` — id, quotation_id (FK), product_id (FK), quantity (Numeric 12,2), unit_price (Numeric 12,2), discount_percent (Numeric 5,2), line_total (Numeric 12,2), category_snapshot (String, nullable)
- `app/models/quotation.py::QuotationStatus` — Draft, Pending Approval, Approved, Sent, Under Negotiation, Confirmed, Fulfilled, Rejected
- **No `recalculate_quotation_totals` function exists** — `app/services/quotation_service.py` is an empty placeholder
- **No line-creation service function exists**

### Product Model
- `app/models/product.py::Product` — id, name (unique), category, base_price (Numeric 12,2), unit, tax_rate (Numeric 5,2), description (nullable)
- **No `cost` field** — see Assumptions below

### Warehouse Stub
- `app/models/warehouse.py` — empty placeholder (docstring only)
- `app/models/warehouse_stock.py` — empty placeholder (docstring only)
- `app/models/fulfillment.py` — empty placeholder (docstring only)

### Audit Log
- `app/models/audit_log.py::AuditLog` — id, entity_type (String 100), entity_id (int), user_id (FK users, nullable), action (String 100), reason (Text, nullable), timestamp (DateTime with tz, server_default now())
- Write pattern: `db.add(AuditLog(entity_type="quotation", entity_id=q.id, user_id=user.id, action="...", reason="...")); db.commit()`

### DB Session
- `app/db/session.py::get_db() -> Generator[Session, None, None]` — sync generator
- `app/db/session.py::SessionLocal = sessionmaker(bind=engine, ...)`
- `app/db/session.py::engine = create_engine(settings.database_url, pool_pre_ping=True)`

### Migration State
- Single head: `20260905_0001` (core foundation)
- Tables: users, customers, products, quotations, quotation_lines, audit_logs

### Celery & Redis
- `app/core/celery_app.py::celery_app = Celery("dealflow360", broker=settings.redis_url, backend=settings.redis_url)`
- `app/core/redis_client.py::get_redis() -> Redis`
- Docker compose has **no Redis or Celery worker services** — Group B adds them

---

## Stubbed Foundation Interfaces

### `app/services/quotation_helpers.py` (NEW — Group B)
- `recalculate_quotation_totals(db, quotation_id)` — sums `line_total` across quotation lines, returns dict with totals
- `add_quotation_line(db, quotation_id, product_id, quantity)` — creates a QuotationLine using Product.base_price as unit_price
- **TODO(foundation)**: these are minimal stubs. The real quotation service (Group A) may implement richer discount/margin logic. Reconcile when Group A's quotation_service.py is ready.

---

## Assumptions & Design Choices

### Margin Calculation (no cost field)
The `Product` model has `base_price` but no `cost` field. For upsell margin calculations:
- **Revenue** = `Product.base_price` (the selling price)
- **Cost** is unknown; we define margin_delta as `base_price` of the suggested product itself
- The `minimum_margin_threshold` in `upsell_config` filters on `base_price * (1 - discount_percent/100)` as the effective margin contribution
- In practice this means: the threshold acts as a minimum effective price filter
- **When Group A implements pricing service**, this should be updated to use resolved price - cost

### Backorder Consolidation
- Implemented as **option (a)**: explicit prompt. When stock is replenished, a Celery task marks matching open backorders as consolidation candidates. A rep must then call `POST /fulfillment/backorders/{id}/consolidate` to complete it.
- This matches the spec: "a 'Consolidate Remaining Backorder' prompt appears automatically"

### Duplicate Upsell Handling
- When adding a suggestion for a product that already exists as a QuotationLine on the quotation, the existing line's **quantity is incremented** rather than rejected. This is documented behavior.

### Quotation Ownership Check
- For `POST /upsell/suggestions/add`, we verify the calling user is the quotation's `rep_id` OR has Admin/SalesManager role. SalesReps can only add to their own quotations.

### Fulfillment Split Line Processing Order
- In the multi-warehouse fallback, lines are processed in order of `quotation_line.id` (ascending) for deterministic, testable results.

### Suggested Products with Zero Stock
- Products with zero stock across all warehouses ARE still returned in upsell suggestions. Fulfillment is a separate concern.

### Router Registration
- Auto-discovery is already in place via `app/api/v1/api.py::build_api_router()`. New endpoint files in `app/api/v1/endpoints/` are picked up automatically. No shared file edits needed for routing.

### Model Registration for Alembic
- `app/db/base.py` must import new models for Alembic autogenerate to see them. This is a minimal additive edit (import lines only) to a foundation file.
