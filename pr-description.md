# PR Description

## Summary

Implements the Core Support Ticket Management System: a React + Vite frontend, an
Express + Prisma backend, and SQLite persistence. Internal users can create, list, view,
update, comment on, search, and progress tickets through an enforced status state machine.
The backend is the authority for validation and transitions; the frontend renders only
valid actions and surfaces backend errors.

## Features Implemented

- Create / list / view / update tickets; reassign assignee.
- Enforced status state machine (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED; OPEN/IN_PROGRESS -> CANCELLED).
- Add comments to tickets.
- Keyword search (title + description) and status filtering.
- Backend input validation and consistent error handling.
- Loading / empty / error states and toasts in the UI.

## Technical Changes

- Backend: Express (TS), Zod validation, typed errors + central handler, `stateMachine.ts` as the single source of truth, routes for users/tickets/comments/status, `/api/meta/transitions`.
- Frontend: React Router, TanStack Query, create modal, detail view with transition controls, "Acting as" user context (auth stand-in), toast system.
- Shared domain constants (`lib/domain.ts`) reused by validation, state machine, and seed.

## Database Changes

- New Prisma schema for SQLite with `users`, `tickets`, `comments`.
- Initial migration + deterministic seed (4 users, 8 tickets spanning all statuses/priorities, 4 comments).
- Indexes on `tickets.status` and `comments.ticketId`.

## Testing Done

- Vitest + Supertest integration tests: 26/26 passing.
- Covers valid/invalid state transitions (with DB-unchanged assertions), validation, search/filter, comments.
- Unit tests for the pure state-machine functions.
- Manual end-to-end verification of the UI and persistence across restart.

## AI Usage Summary

AI (Cursor) was used across the lifecycle: requirement/edge-case analysis, design
trade-offs (SQLite vs Postgres, API shape), code generation for boilerplate, generating
the transition test matrix, interpreting an EPERM seed error, and a critical review pass
on the state machine and error handling. See `ai-prompts/` and `final-ai-usage-summary.md`.

## Screenshots / Demo Notes

Run both dev servers and open http://localhost:5173. Use the "Acting as" selector to pick
a user, create a ticket, open it, and try the status buttons (only valid transitions are
offered). See `ui-flow.md`.

## Known Limitations

- No authentication (optional Stretch); acting user is chosen via a selector.
- No pagination/sorting or priority/assignee filters (Stretch).
- Frontend has no automated component/E2E tests (verified manually).

## Future Improvements

- Add JWT auth + role-based access and protected routes.
- Add priority/assignee filters, sorting, and pagination.
- Add frontend component tests and a Swagger/OpenAPI spec.
- Dockerfile + CI workflow.
