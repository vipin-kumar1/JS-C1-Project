# Debugging Notes

## Issue 1: `tsx` seed command fails with EPERM during `prisma migrate dev`

### Problem
Running `prisma migrate dev` created the migration successfully but the automatic seed
step crashed with `EPERM ... listen ... tsx-501/<pid>.pipe`. The migration itself was
fine; the seed subprocess could not start.

### How I Investigated
Read the stack trace: the error came from `tsx`'s CLI trying to create an IPC named pipe
under the OS temp directory. It was a sandbox/permissions restriction on creating that
pipe, not a bug in the seed script or schema.

### How AI Helped
Asked the assistant to interpret the EPERM/IPC error. It identified that the failure was
environmental (temp-dir pipe creation) rather than a data or Prisma issue, and suggested
running the seed as a separate, direct step.

### What I Validated
Ran `npx tsx prisma/seed.ts` directly (outside the restricted context). It completed and
reported `4 users, 8 tickets, 4 comments`. Confirmed the DB was populated via the API.

### Final Fix
Kept schema generation/migration and seeding as separate README steps
(`npm run prisma:migrate` then `npm run db:seed`) instead of relying solely on Prisma's
auto-seed hook, which is more robust across environments.

## Issue 2: Debounce hook used `useMemo` with a cleanup return

### Problem
The initial `useDebounced` hook in `TicketListPage` used `useMemo` and returned a cleanup
function. `useMemo` does not run cleanups, so the debounce timer would never be cleared,
risking stale updates and leaked timers.

### How I Investigated
Reviewed the hook while reading through the list page. Recognized that only `useEffect`
runs the returned cleanup; `useMemo` is for memoizing values, not side effects.

### How AI Helped
Used AI review to flag the misuse and confirm the correct pattern (side effect + cleanup
belongs in `useEffect`).

### What I Validated
Switched to `useEffect`, rebuilt with `npm run build` (type-check + Vite) with no errors,
and confirmed search debouncing behaves correctly in the browser.

### Final Fix
Rewrote `useDebounced` to use `useEffect` with a `setTimeout` and a `clearTimeout` cleanup.

## Issue 3: Verifying SQLite search was actually case-insensitive

### Problem
Needed to confirm keyword search matched regardless of case, since SQLite `LIKE`
semantics can be surprising.

### How I Investigated
Queried the running API with a lowercase term for a title stored in mixed case
(`?q=login` against "Login page returns 500 error") and a term that only appears in a
description (`?q=report`).

### How AI Helped
Confirmed that SQLite `LIKE` (which Prisma's `contains` uses) is case-insensitive for
ASCII, so no extra `mode: "insensitive"` was needed (and is unsupported on SQLite).

### What I Validated
`?q=login` returned the mixed-case ticket; `?q=report` matched via the description. Both
behaved as expected.

### Final Fix
No code change needed; documented the behavior in `requirements-analysis.md` and the API contract.
