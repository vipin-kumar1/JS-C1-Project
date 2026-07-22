# Test Strategy

## Test Scope

The mandatory tier is integration testing of the status state machine. Around it, the
suite also covers input validation, keyword search, status filtering, and comments. A
small unit-test file covers the pure state-machine functions directly. The frontend is
verified manually against the acceptance criteria (component tests are noted as not
covered below).

Tooling: Vitest (runner) + Supertest (HTTP-level integration against the real Express
app) + a dedicated SQLite test database created fresh per run.

## Unit Tests

`src/backend/tests/stateMachine.test.ts`
- `canTransition` returns true for every allowed edge and false for illegal ones.
- `isTerminalStatus` is true for CLOSED and CANCELLED.
- `getAllowedTransitions` returns the exact allowed set per status.

## Component Tests

Frontend component tests use Vitest + React Testing Library (jsdom), with the API module
mocked so tests are deterministic and offline. Run with `cd src/frontend && npm test`.

- `src/components/Badges.test.tsx`: status/priority badges render the correct label and class.
- `src/components/CreateTicketModal.test.tsx`: empty required fields show validation errors
  and do not call the API; valid input calls `api.createTicket` with the acting user and
  closes; a backend error is surfaced without closing.
- `src/pages/TicketListPage.test.tsx`: renders tickets from the API; shows the empty state;
  clicking a status chip re-queries with that status; typing issues a debounced keyword search.

## API / Integration Tests

`src/backend/tests/tickets.test.ts` (runs the real app + DB):
- Create: valid create returns 201 in OPEN with correct assignee and `allowedTransitions`.
- Validation: missing title -> 400; non-existent `createdBy` -> 400.
- State machine (valid): OPEN->IN_PROGRESS, IN_PROGRESS->RESOLVED, RESOLVED->CLOSED, OPEN->CANCELLED, IN_PROGRESS->CANCELLED all return 200 and persist.
- State machine (invalid): OPEN->RESOLVED, OPEN->CLOSED, IN_PROGRESS->CLOSED, RESOLVED->IN_PROGRESS, CLOSED->OPEN, CANCELLED->IN_PROGRESS all return 409 and leave the DB status unchanged.
- Same-status transition -> 409; unknown status value -> 400; missing ticket -> 404.
- Search/filter: filter by status; keyword search across title/description; combined keyword + status intersect.
- Comments: adding a comment returns 201 and appears in the detail view; empty message -> 400.

## Edge Case Tests

Covered within the integration suite: no-op transitions, unknown enum values, referential
integrity (non-existent user), empty comment, and verification that rejected transitions
do not mutate persisted state.

## Tests Not Covered (and why)

- Full end-to-end (browser) tests: the component tests exercise the UI logic against a
  mocked API and the backend integration tests cover the real API, so a separate E2E tier
  adds little for a Core exercise.
- Load/performance tests: out of scope for a Core exercise on SQLite.
- Auth tests: authentication is not implemented (optional Stretch).
