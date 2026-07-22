# Acceptance Criteria

Mapped to the 11 Core acceptance criteria in the assessment. All are met and, where
applicable, covered by automated tests (see `test-results.md`).

## Core

- [x] A user can create a ticket via the UI. (`CreateTicketModal` -> `POST /api/tickets`)
- [x] A user can view all tickets from the database. (`TicketListPage` -> `GET /api/tickets`)
- [x] A user can open a ticket detail view. (`TicketDetailPage` -> `GET /api/tickets/:id`)
- [x] A user can update ticket fields and reassign. (`PATCH /api/tickets/:id`)
- [x] A user can add comments. (`POST /api/tickets/:id/comments`)
- [x] Status changes only through valid transitions; invalid ones are rejected. (`PATCH /api/tickets/:id/status`, 409 on invalid)
- [x] Keyword search and status filter work. (`GET /api/tickets?q=&status=`)
- [x] Data remains available after restart. (SQLite file persistence)
- [x] Backend validation prevents invalid records. (Zod schemas + user-existence checks)
- [x] No secrets committed to the repo. (`.env` git-ignored; only `.env.example` committed)
- [x] State-machine integration tests pass. (`tests/tickets.test.ts`, `tests/stateMachine.test.ts`)

## Validation

- [x] Title required, min length enforced (400 on failure).
- [x] Description required, min length enforced.
- [x] Priority restricted to LOW/MEDIUM/HIGH.
- [x] Status restricted to the five known values.
- [x] `createdBy` / `assignedTo` must reference existing users.
- [x] Comment message must be non-empty.

## Error Handling

- [x] Central error handler maps ZodError -> 400, invalid transition -> 409, not found -> 404, unknown -> 500.
- [x] Consistent JSON error shape: `{ error: { code, message, details? } }`.
- [x] UI shows loading, empty, and error states and toasts for failures.

## Testing

- [x] Integration tests prove valid transitions succeed and invalid ones are rejected.
- [x] Validation, search, filter, and comment behavior covered.
- [x] Unit tests cover the pure state-machine functions.

## Documentation

- [x] README with setup/run instructions.
- [x] Full lifecycle artifacts (requirements, design, api-contract, data-model, ui-flow, test strategy/results, debugging, review, reflection, PR).
- [x] Prompt history under `ai-prompts/` and Cursor workflow under `tool-specific/cursor-workflow/`.
