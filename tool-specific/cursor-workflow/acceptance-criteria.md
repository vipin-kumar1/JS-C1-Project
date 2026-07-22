# Acceptance Criteria (Cursor)

This mirrors the root `acceptance-criteria.md` and is the checklist Cursor validates
against before considering a change done.

## Core
- [x] Create a ticket via the UI.
- [x] View all tickets from the database.
- [x] Open a ticket detail view.
- [x] Update ticket fields and reassign.
- [x] Add comments.
- [x] Status changes only through valid transitions; invalid ones rejected (409).
- [x] Keyword search and status filter work.
- [x] Data remains available after restart (SQLite).
- [x] Backend validation prevents invalid records (400).
- [x] No secrets committed (`.env` ignored; only `.env.example`).
- [x] State-machine integration tests pass (26/26).

## Traceability

Each criterion maps to a route/page and a test — see root `acceptance-criteria.md` and
`test-strategy.md`. The state machine is defined once in `lib/stateMachine.ts`, enforced
in `routes/tickets.ts`, and covered in `tests/tickets.test.ts` + `tests/stateMachine.test.ts`.
