# Spec (Cursor)

## Entities

- User(id, name, email, role) — seeded only.
- Ticket(id, title, description, priority, status, assignedTo, createdBy, createdAt, updatedAt).
- Comment(id, ticketId, message, createdBy, createdAt).

## Status state machine (authoritative)

```
OPEN         -> IN_PROGRESS, CANCELLED
IN_PROGRESS  -> RESOLVED, CANCELLED
RESOLVED     -> CLOSED
CLOSED       -> (terminal)
CANCELLED    -> (terminal)
```

- Invalid transitions rejected by the backend with 409; persisted status unchanged.
- Same-status transition rejected with 409. Unknown status value rejected with 400.

## API (see api-contract.md for full detail)

- `GET /api/users`
- `GET /api/tickets?q=&status=`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `POST /api/tickets/:id/comments`
- `GET /api/meta/transitions`, `GET /api/health`

## Validation

- title 3-140, description 5-5000, priority in {LOW,MEDIUM,HIGH}, status in the 5 values.
- `createdBy`/`assignedTo` must reference existing users; comment message 1-2000.

## Frontend

- List page: debounced search + status filter + card grid + create modal.
- Detail page: inline edit, assignee, status transitions from `allowedTransitions`, comments.
- Loading/empty/error states; toasts; "Acting as" user context (auth stand-in).

## Out of scope (Stretch)

Auth/RBAC, pagination/sorting, priority/assignee filters, Swagger, Docker, CI, frontend E2E tests.
