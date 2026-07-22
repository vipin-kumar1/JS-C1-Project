# AI Prompts — Design

## Prompt 1 (persistence choice)
"Compare SQLite vs PostgreSQL for this Core app given the requirement that data survives
restart and setup must run from a README with no external services."

- Response summary: SQLite is file-based, zero-config, restart-safe, and ideal for a
  small Core; Postgres adds operational overhead not justified here.
- Accepted: SQLite via Prisma.
- Changed: none. Recorded trade-off in `design-notes.md`.

## Prompt 2 (enum handling on SQLite)
"How should I represent status/priority enums given SQLite has no native enum type?"

- Response summary: store as strings; enforce allowed values in the app layer with a
  shared constants module + Zod + the state machine.
- Accepted: `lib/domain.ts` constants reused by validation, state machine, and seed.
- Rejected: adding a DB-level enum/check-constraint abstraction as unnecessary.

## Prompt 3 (error contract)
"Propose a single consistent JSON error shape and a mapping from error types to HTTP codes."

- Response summary: `{ error: { code, message, details? } }`; Zod->400, invalid
  transition->409, not found->404, else 500.
- Accepted: implemented in `middleware/errorHandler.ts` and typed errors in `lib/errors.ts`.
