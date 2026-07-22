# Tasks (Cursor)

Traceable task list; all complete for this submission.

- [x] Scaffold `src/backend`, `src/frontend`, configs, `.gitignore`, `.env.example`.
- [x] Prisma schema (User/Ticket/Comment) on SQLite + migration.
- [x] Deterministic seed (`prisma/seed.ts`): 4 users, 8 tickets (all statuses/priorities), 4 comments.
- [x] Domain constants (`lib/domain.ts`) + state machine (`lib/stateMachine.ts`).
- [x] Zod validation schemas (`lib/validation.ts`) + typed errors (`lib/errors.ts`).
- [x] Central error handler + 404 fallback (`middleware/errorHandler.ts`).
- [x] Routes: users, tickets (list/create/detail/update), status transition, comments.
- [x] Expose state machine via `/api/meta/transitions`; health check.
- [x] Frontend: API client + types.
- [x] Frontend: list page (search/filter/badges), create modal.
- [x] Frontend: detail page (edit/assign/status/comments), toasts, "Acting as" context.
- [x] Tests: state-machine unit + integration (valid/invalid/validation/search/comments).
- [x] Verify: migrate+seed, boot both apps, run suite (26/26), manual acceptance checks.
- [x] Documentation artifacts (requirements, design, api, data model, ui flow, tests, review, reflection, PR, prompts).
- [x] Root README + candidate-info.
