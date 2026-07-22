# Implementation Plan

## Overview

Deliver the Core Support Ticket Management System with a clean separation between a
React frontend and an Express/Prisma backend, using SQLite for zero-config persistence.
The status state machine is centralized in one module and enforced server-side, then
covered by integration tests. Documentation artifacts are produced alongside the code.

## Task Breakdown

1. Scaffold repo: `src/backend`, `src/frontend`, configs, `.gitignore`, `.env.example`.
2. Data layer: Prisma schema (User/Ticket/Comment) on SQLite, migration, deterministic seed.
3. Domain: shared status/priority constants + state-machine module (single source of truth).
4. Backend API: tickets/comments/users routes, Zod validation, central error handler, CORS.
5. Frontend: list (search/filter/badges), create modal, detail (edit/assign/status/comments), states.
6. Tests: Vitest + Supertest integration tests for the state machine, validation, search.
7. Artifacts: requirements, design, API contract, data model, UI flow, test docs, prompts, reflection.
8. README + candidate info.
9. Verify end-to-end: migrate + seed, boot both apps, run test suite, exercise every criterion.

## Milestones

- M1: Backend + DB + state machine + tests green.
- M2: Frontend wired to API with full CRUD + search/filter + status transitions.
- M3: All documentation artifacts complete and consistent with the code.
- M4: End-to-end verification and README validated.

## AI Usage Plan

- Requirement analysis: use AI to enumerate edge cases (esp. state-machine boundaries) and challenge assumptions.
- Design: use AI to compare persistence options (SQLite vs Postgres) and API shapes.
- Implementation: generate boilerplate (Prisma schema, Express routes, React components); review each diff.
- Testing: generate the transition test matrix (valid + invalid) and validation cases.
- Debugging: paste stack traces / failing output for hypotheses; validate fixes by re-running.
- Review: ask AI for a critical pass over error handling, validation, and the state machine.

## Risks

- State-machine logic scattered across layers, causing drift.
- Client trusting itself for transition legality (security/correctness gap).
- SQLite case-sensitivity surprising search behavior.
- Seed data not covering all statuses, making features hard to demo.
- Committing secrets or the SQLite DB file.

## Mitigation

- One `stateMachine.ts` module consumed by API, tests, and exposed to the client via `/api/meta/transitions`.
- Backend always re-validates transitions; the client only uses `allowedTransitions` to render actions.
- Confirm SQLite LIKE is case-insensitive for ASCII; verify with a lowercase search during testing.
- Seed tickets spanning every status and priority.
- `.gitignore` excludes `.env` and `*.db`; only `.env.example` committed.
