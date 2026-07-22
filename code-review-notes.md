# Code Review Notes

## AI-Assisted Review Summary

I asked the assistant to review the backend for three things specifically: (1) whether the
state machine could be bypassed, (2) whether validation and error handling were consistent,
and (3) whether any secrets or fragile setup steps existed. Key points raised:

- The status route must re-read the current status from the DB before deciding legality,
  rather than trusting any status sent by the client. Confirmed the implementation reads
  `existing.status` from the DB first.
- Same-status "transitions" should be treated explicitly (returning 409) rather than
  silently succeeding, to avoid confusing no-op updates.
- Error responses should share one shape so the frontend can handle them uniformly.
- The client must not be the authority on allowed transitions; it should only render what
  the backend advertises via `allowedTransitions`.

## My Review Observations

- `createApp()` is separated from `server.ts` so tests can mount the app without a port. Good for testability.
- Referential integrity (user existence) is checked in the app layer to return a clean 400
  instead of a raw DB/FK error. Worth keeping.
- Domain constants are centralized in `lib/domain.ts` and reused by validation, the state
  machine, and seed data, preventing drift.
- The frontend `useDebounced` hook originally misused `useMemo` (see `debugging-notes.md`).

## Changes Made After Review

- Fixed the debounce hook to use `useEffect` with proper cleanup.
- Kept the explicit same-status -> 409 branch in the status route.
- Ensured the invalid-transition 409 includes `{ from, to, allowed }` in `details` to aid clients.
- Verified `.gitignore` excludes `.env` and `*.db`; only `.env.example` is committed.

## Suggestions Rejected (and why)

- "Add `mode: 'insensitive'` to the search filter": rejected because SQLite does not
  support Prisma's case-insensitive mode and ASCII `LIKE` is already case-insensitive.
- "Introduce a status enum in the database": rejected because SQLite lacks native enums;
  the app-layer constants + state machine already provide the guarantee without adding
  a migration-heavy abstraction.
- "Add optimistic UI updates for status changes": rejected for Core to keep behavior
  simple and always reflect the backend's authoritative state after each mutation.
