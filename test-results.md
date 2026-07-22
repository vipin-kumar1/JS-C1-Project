# Test Results

## Backend

Command: `cd src/backend && npm test`

Latest run:

```
 RUN  v2.1.9 /Users/vipinkumar/Desktop/JS-C1-Project/src/backend

Datasource "db": SQLite database "test.db" at "file:./test.db"
🚀  Your database is now in sync with your Prisma schema.

 ✓ tests/tickets.test.ts (22 tests)
 ✓ tests/stateMachine.test.ts (4 tests)

 Test Files  2 passed (2)
      Tests  26 passed (26)
```

## Frontend

Command: `cd src/frontend && npm test`

Latest run:

```
 RUN  v2.1.9 /Users/vipinkumar/Desktop/JS-C1-Project/src/frontend

 ✓ src/components/Badges.test.tsx (3 tests)
 ✓ src/components/CreateTicketModal.test.tsx (3 tests)
 ✓ src/pages/TicketListPage.test.tsx (4 tests)

 Test Files  3 passed (3)
      Tests  10 passed (10)
```

Frontend tests use Vitest + React Testing Library (jsdom) with the API module mocked.
They cover badge rendering, create-ticket validation/submit/error handling, and the list
page's rendering, empty state, status filtering, and debounced search.

## Summary

- Backend: 26 / 26 tests passing across 2 files.
- Frontend: 10 / 10 tests passing across 3 files.
- State-machine coverage: 5 valid transitions succeed (200); 6 invalid transitions
  rejected (409) with the persisted status verified unchanged; same-status (409) and
  unknown-status (400) edge cases covered.
- Validation coverage: missing title (400), non-existent user (400), empty comment (400).
- Search/filter coverage: status filter, keyword search (title + description), combined intersect.

## How the test DB is isolated

`tests/globalSetup.ts` sets `DATABASE_URL=file:./test.db`, removes any existing test DB,
and runs `prisma db push` to create a fresh schema before the suite. `tests/helpers.ts`
resets tables and seeds two users in `beforeEach`, so each test runs against a known,
isolated dataset. The dev database (`dev.db`) is never touched by tests.

## Manual verification (frontend + persistence)

Performed against the running stack (`npm run dev` in both apps):
- Created, listed, opened, edited, reassigned, and commented on tickets via the UI.
- Confirmed only valid transition buttons appear; a forced invalid transition (via curl)
  returns 409 and the UI surfaces the error.
- Restarted the backend and confirmed all data persisted (SQLite file).
- Verified API directly with curl: health OK, status filter returns correct subset,
  case-insensitive keyword search works, invalid transition -> 409, valid -> 200,
  missing title -> 400.
