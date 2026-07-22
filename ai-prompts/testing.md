# AI Prompts — Testing

## Prompt 1 (transition matrix)
"Generate a Vitest + Supertest suite proving the state machine: every valid transition
returns 200 and persists; every invalid transition returns 409 AND leaves the persisted
status unchanged. Include same-status (409) and unknown-status (400) cases."

- Response summary: parameterized `it.each` tests for valid and invalid transitions.
- Accepted: the valid/invalid matrices.
- Changed: added an explicit DB re-read assertion after each rejected transition to prove
  no state change occurred (the response code alone isn't enough evidence).

## Prompt 2 (isolation)
"Set up an isolated SQLite test DB created fresh per run, without touching dev.db, and
reset tables + seed two users before each test."

- Response summary: `globalSetup.ts` runs `prisma db push` on `test.db`; `helpers.ts`
  resets and seeds in `beforeEach`.
- Accepted: as implemented; `fileParallelism: false` to avoid DB contention.

## Prompt 3 (validation + search)
"Add tests for missing title (400), non-existent user (400), empty comment (400), status
filter, keyword search across title/description, and combined keyword+status intersect."

- Response summary: added the corresponding cases.
- Accepted: all. Confirmed 26/26 passing (see `test-results.md`).
