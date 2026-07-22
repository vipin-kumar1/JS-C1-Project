# Candidate Information

Name: Vipin Kumar /  Role: TL  /  Primary Technology Stack: React + Node.js (TypeScript)
Primary AI Tool Used: Cursor  /  Project Option Selected: Support Ticket Management System (Backend-heavy, Core)
Assessment Start Date: 22 JULY 2026  /  Submission Date: 22 JULY 2026

## Project Summary

A small full-stack Support Ticket Management System. Internal users create, list, view,
update, comment on, search, and progress support tickets through an enforced status
state machine. The backend rejects invalid state transitions and invalid input; the
frontend renders only valid actions and surfaces backend errors clearly. All data is
persisted in SQLite and survives restarts.

The signature engineering piece is the ticket status state machine, enforced on the
backend and covered by integration tests.

## Tools Used

- Cursor (primary AI tool) for requirement analysis, planning, code generation, testing, debugging, and review.
- Frontend: React 18 + Vite + TypeScript, React Router, TanStack Query.
- Backend: Node.js + Express + TypeScript, Prisma ORM, Zod validation.
- Database: SQLite (file-based) via Prisma migrations + seed script.
- Testing: Vitest + Supertest.

## Setup Summary

See `README.md` for full instructions. In short:

1. `cd src/backend && npm install && cp .env.example .env`
2. `npm run prisma:generate && npm run prisma:migrate && npm run db:seed`
3. `npm run dev` (API on http://localhost:4000)
4. `cd ../frontend && npm install && npm run dev` (UI on http://localhost:5173)
5. Backend tests: `cd src/backend && npm test`
