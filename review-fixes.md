# Review Fixes

Concrete changes made in response to review (see `code-review-notes.md` and `debugging-notes.md`).

| # | Finding | Fix | File(s) |
|---|---|---|---|
| 1 | `useDebounced` used `useMemo` with a cleanup return (timer never cleared) | Rewrote using `useEffect` + `clearTimeout` | `src/frontend/src/pages/TicketListPage.tsx` |
| 2 | Same-status change could be a silent no-op | Explicitly return 409 for same-status transitions | `src/backend/src/routes/tickets.ts` |
| 3 | Clients need to know why a transition failed | 409 body includes `details: { from, to, allowed }` | `src/backend/src/routes/tickets.ts` |
| 4 | Client could assume transition legality | Backend re-checks DB status; client only renders `allowedTransitions` | `src/backend/src/routes/tickets.ts`, `src/frontend/src/pages/TicketDetailPage.tsx` |
| 5 | Non-existent user references gave unclear errors | Explicit existence checks return 400 `VALIDATION_ERROR` | `src/backend/src/routes/tickets.ts` |
| 6 | Auto-seed step fragile in restricted environments | Documented separate `db:seed` step in README | `README.md`, `database/setup-notes.md` |

## Verification after fixes

- `npm run build` (frontend) passes type-check + bundle.
- `npm test` (backend) passes 26/26.
- Manual API checks confirm 409 on invalid transitions, 200 on valid, 400 on bad input.
