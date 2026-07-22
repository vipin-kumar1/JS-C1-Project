# Design Notes

## Architecture Overview (frontend, backend, database)

```
+-------------------+        HTTP/JSON        +----------------------+       Prisma      +-----------+
|  React + Vite     |  ------------------->   |  Express (TypeScript)|  -------------->  |  SQLite   |
|  (TanStack Query) |  <-------------------   |  Zod + state machine |  <--------------  |  dev.db   |
+-------------------+                         +----------------------+                   +-----------+
        5173                                            4000
```

- The frontend is a SPA that talks to the backend over `/api`. In dev, Vite proxies `/api` to `:4000`.
- The backend owns all business rules: validation, the state machine, and persistence.
- SQLite gives file-based persistence with zero external services, so the app runs from the README anywhere.

## Frontend Design

- Routing: `/` (ticket list) and `/tickets/:id` (detail). React Router.
- Data: TanStack Query for fetching, caching, and invalidation after mutations.
- State/actions:
  - `TicketListPage`: debounced keyword search + status filter chips + card grid + create modal.
  - `TicketDetailPage`: inline edit form, assignee dropdown, status transition buttons (rendered from `allowedTransitions`), comment thread + add form.
- Cross-cutting: `Toast` context for success/error feedback; `CurrentUser` context ("Acting as") to supply an acting user id in the absence of auth.
- The client never decides transition legality on its own; it only renders the buttons the backend says are allowed, and always surfaces backend errors (e.g. a 409 from a stale page).

## Backend Design

- `createApp()` builds the Express app (exported separately from `server.ts` so tests import it without binding a port).
- Routers: `/api/users`, `/api/tickets` (+ nested `/status` and `/comments`).
- Validation: Zod schemas in `lib/validation.ts` parse request bodies/queries at the boundary.
- Errors: typed `AppError` subclasses (`ValidationError`, `NotFoundError`, `InvalidTransitionError`) mapped by a central `errorHandler` to consistent JSON.
- State machine: `lib/stateMachine.ts` holds `ALLOWED_TRANSITIONS` and helpers. The status route re-checks the current DB status before applying a change and returns 409 on any illegal or no-op transition.

## Database Design

- Three tables: `users`, `tickets`, `comments` (see `data-model.md`).
- SQLite has no native enums; status/priority are stored as strings and constrained in the app layer (Zod + state machine), keeping one source of truth.
- Foreign keys: `tickets.createdBy` and `tickets.assignedTo` -> `users.id`; `comments.ticketId` -> `tickets.id` (cascade delete), `comments.createdBy` -> `users.id`.
- Index on `tickets.status` (common filter) and `comments.ticketId`.

## Validation Strategy

- All writes validated by Zod before any DB access.
- Referential checks (user existence) done explicitly to return a clear 400 rather than a DB-level failure.
- The status endpoint validates both the input shape (known status) and the business rule (legal transition).

## Error Handling Strategy

- Single error contract: `{ error: { code, message, details? } }`.
- Mapping: Zod -> 400 `VALIDATION_ERROR`; `InvalidTransitionError` -> 409 `INVALID_TRANSITION`; `NotFoundError` -> 404; unexpected -> 500 `INTERNAL_ERROR` (logged server-side).
- Frontend maps these into inline field errors, empty/error panels, and toasts.

## Testing Strategy Link

See `test-strategy.md` for scope and `test-results.md` for the latest run output.
