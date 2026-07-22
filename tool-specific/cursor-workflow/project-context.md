# Project Context (Cursor)

This document is the persistent context I keep so Cursor works from ground truth rather
than guessing.

## What we're building

Core Support Ticket Management System. Internal users create, list, view, update, comment
on, search, and progress support tickets through an enforced status state machine.

## Stack

- Frontend: React 18 + Vite + TypeScript, React Router, TanStack Query.
- Backend: Node.js + Express + TypeScript, Prisma ORM, Zod.
- Database: SQLite (file-based) via Prisma migrations + seed.
- Tests: Vitest + Supertest.

## Non-negotiable rules

- The backend is the source of truth for validation and status transitions.
- The status state machine lives in exactly one module (`src/backend/src/lib/stateMachine.ts`).
- Domain constants (statuses, priorities) live in `src/backend/src/lib/domain.ts` and are reused everywhere.
- One error contract: `{ error: { code, message, details? } }`.
- No secrets in the repo; only `.env.example` is committed; `*.db` git-ignored.
- Prefer minimal, reviewable changes; do not add dependencies without justification.

## Repository map

- `src/backend/src/lib/` — domain constants, state machine, prisma client, errors, validation.
- `src/backend/src/routes/` — `users.ts`, `tickets.ts`.
- `src/backend/src/middleware/errorHandler.ts` — central error mapping.
- `src/backend/prisma/` — `schema.prisma`, `seed.ts`.
- `src/backend/tests/` — integration + unit tests.
- `src/frontend/src/` — `pages/`, `components/`, `context/`, `api/client.ts`, `types.ts`.

## Definition of done

Build type-checks, `npm test` is green, all Core acceptance criteria verified, and the
lifecycle artifacts are consistent with the code.
