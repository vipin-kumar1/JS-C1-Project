# Support Ticket Management System

A small full-stack application for managing support tickets. Internal users create, list,
view, update, comment on, search, and progress tickets through an **enforced status state
machine**. The backend is the authority for validation and transitions; the frontend
renders only valid actions and surfaces backend errors clearly. All data is persisted in
SQLite and survives restarts.

Built as the Core of the JS AI Capability Exercise (Backend-heavy option).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, React Router, TanStack Query |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | SQLite via Prisma ORM |
| Tests | Vitest + Supertest |

## Status State Machine

```
OPEN         -> IN_PROGRESS, CANCELLED
IN_PROGRESS  -> RESOLVED, CANCELLED
RESOLVED     -> CLOSED
CLOSED       -> (terminal)
CANCELLED    -> (terminal)
```

Invalid transitions are rejected by the backend with HTTP 409 (persisted status unchanged)
and handled clearly in the UI (only valid transition buttons are shown).

## Repository Structure

```
.
├── README.md, candidate-info.md, tool-workflow.md, reflection.md, ...   # lifecycle artifacts
├── requirements-analysis.md, design-notes.md, api-contract.md, ...
├── ai-prompts/                 # prompt history grouped by activity
├── tool-specific/cursor-workflow/   # persistent project context, spec, tasks, rules
├── database/                   # setup notes (Prisma files live in src/backend/prisma)
└── src/
    ├── backend/                # Express + Prisma API (+ tests/)
    └── frontend/               # React + Vite app
```

## Prerequisites

- Node.js 18+ and npm.

## Setup & Run

### 1. Backend (API on http://localhost:4000)

```bash
cd src/backend
npm install
cp .env.example .env
npm run prisma:generate     # generate Prisma client
npm run prisma:migrate      # create SQLite schema (migration "init")
npm run db:seed             # seed users, tickets, comments
npm run dev                 # start the API
```

> If `prisma migrate` cannot auto-run the seed in a restricted shell (an environmental
> `tsx` IPC/EPERM error — see `debugging-notes.md`), just run `npm run db:seed` separately.

### 2. Frontend (UI on http://localhost:5173)

In a second terminal:

```bash
cd src/frontend
npm install
npm run dev
```

Open http://localhost:5173. Use the **"Acting as"** selector (top-right) to choose a user
(there is no auth in Core), then create tickets, open them, and progress their status.

## Tests

Backend (Vitest + Supertest, 26 tests) — state-machine rules, validation, search/filter, comments:

```bash
cd src/backend && npm test
```

Frontend (Vitest + React Testing Library, 10 tests) — badges, create-ticket validation/submit,
list rendering, empty state, status filter, debounced search:

```bash
cd src/frontend && npm test
```

See `test-strategy.md` and `test-results.md`.

## API Overview

See `api-contract.md` for full detail. Key endpoints:

- `GET /api/tickets?q=&status=` — list with keyword search + status filter
- `POST /api/tickets` — create
- `GET /api/tickets/:id` — detail with comments
- `PATCH /api/tickets/:id` — update fields / reassign
- `PATCH /api/tickets/:id/status` — status transition (state-machine enforced)
- `POST /api/tickets/:id/comments` — add comment
- `GET /api/users`, `GET /api/meta/transitions`, `GET /api/health`

## Notes

- No secrets are committed. Only `.env.example` (placeholders) is tracked; `.env` and
  `*.db` are git-ignored.
- Authentication is intentionally out of scope (optional Stretch); an "Acting as" selector
  stands in for the acting user.
