# API Contract

Base URL: `http://localhost:4000/api`
Content-Type: `application/json`
Error shape (all errors): `{ "error": { "code": string, "message": string, "details"?: any } }`

Status codes: 200 OK, 201 Created, 400 Validation, 404 Not Found, 409 Invalid Transition, 500 Internal.

---

## GET /health

Purpose: liveness check. Response: `{ "status": "ok" }`.

## GET /meta/transitions

Purpose: expose the state machine to the client. Response: map of status -> allowed next statuses.

## GET /users

Purpose: list seeded users (for assignee/acting-as dropdowns).
Response: `[{ id, name, email, role }]`.

---

## GET /tickets

Purpose: list tickets with optional keyword search and status filter.
Query params:
- `q` (optional): case-insensitive substring match on title OR description.
- `status` (optional): one of OPEN | IN_PROGRESS | RESOLVED | CLOSED | CANCELLED.

Response: `[Ticket]` (each with `assignee`, `creator`, `allowedTransitions`), ordered by `updatedAt` desc.
Validation: unknown `status` value -> 400.

## POST /tickets

Purpose: create a ticket (always starts in OPEN).
Request:
```json
{ "title": "string(3-140)", "description": "string(5-5000)", "priority": "LOW|MEDIUM|HIGH", "createdBy": "userId", "assignedTo": "userId|null" }
```
Response: 201 with the created Ticket.
Validation rules: title/description length; priority enum; `createdBy` required and must exist; `assignedTo` (if provided) must exist.
Error responses: 400 VALIDATION_ERROR.

## GET /tickets/:id

Purpose: fetch a single ticket with its comments.
Response: 200 Ticket incl. `comments[]` (each with `author`) and `allowedTransitions`.
Error responses: 404 NOT_FOUND.

## PATCH /tickets/:id

Purpose: update editable fields (title, description, priority, assignee). Does NOT change status.
Request (at least one field):
```json
{ "title?": "string", "description?": "string", "priority?": "LOW|MEDIUM|HIGH", "assignedTo?": "userId|null" }
```
Response: 200 updated Ticket.
Error responses: 400 (empty body / invalid field / non-existent assignee), 404.

## PATCH /tickets/:id/status

Purpose: transition status through the enforced state machine.
Request: `{ "status": "OPEN|IN_PROGRESS|RESOLVED|CLOSED|CANCELLED" }`
Allowed transitions:
```
OPEN        -> IN_PROGRESS, CANCELLED
IN_PROGRESS -> RESOLVED, CANCELLED
RESOLVED    -> CLOSED
CLOSED      -> (terminal)
CANCELLED   -> (terminal)
```
Response: 200 updated Ticket.
Error responses:
- 400 VALIDATION_ERROR (unknown status value).
- 409 INVALID_TRANSITION (illegal transition or transition to current status); body `details` includes `{ from, to, allowed }`. No state change occurs.
- 404 NOT_FOUND (missing ticket).

## POST /tickets/:id/comments

Purpose: add a comment to a ticket.
Request: `{ "message": "string(1-2000)", "createdBy": "userId" }`
Response: 201 created Comment (with `author`).
Error responses: 400 (empty message / non-existent user), 404 (missing ticket).
