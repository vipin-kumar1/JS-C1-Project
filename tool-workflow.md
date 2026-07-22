# Tool Workflow

## 1. Primary AI tool used

Cursor (agent + inline edits), backed by a persistent project context under
`tool-specific/cursor-workflow/`.

## 2. How I provide project context to the tool

- A written spec, task list, acceptance criteria, and project-context doc in
  `tool-specific/cursor-workflow/` that the tool can read as ground truth.
- Team rules (naming, security defaults, minimal reviewable changes, dependency
  discipline) enforced through workspace rules.
- Pointing the tool at concrete files/paths rather than describing them from memory.

## 3. How I use AI for requirement analysis

I ask it to restate the problem, enumerate edge cases (especially around the status
lifecycle), and generate clarifying questions for a product owner. I then decide which
assumptions to lock in and record them in `requirements-analysis.md`.

## 4. How I use AI for planning and design

I ask for a task breakdown with milestones and a risk/mitigation table, and I compare
design options (e.g. SQLite vs Postgres, whether status belongs in the generic update
endpoint). I make the final call and capture it in `implementation-plan.md` / `design-notes.md`.

## 5. How I use AI for code generation

For boilerplate that has a clear shape: Prisma schema, Express routers, Zod schemas, React
components, and the seed script. I keep generation scoped to one concern at a time and
review each diff.

## 6. How I validate AI-generated code

- Type-checked build (`npm run build`) and the full test suite (`npm test`).
- Direct API checks with curl for the critical paths (transitions, validation, search).
- Reading each diff for correctness, especially the state machine and error mapping.

## 7. How I use AI for testing

I ask it to derive the complete valid/invalid transition matrix and validation/search
cases, then I harden them (e.g. asserting the DB status is unchanged after a rejected
transition) and run them.

## 8. How I use AI for debugging

I paste the actual error/stack trace and ask for hypotheses. Example: an EPERM error
during seeding was correctly identified as an environmental temp-dir/IPC restriction, not
a Prisma bug, which saved time.

## 9. How I use AI for code review

I ask for a targeted, critical pass: can the state machine be bypassed, are errors
consistent, are there secrets or fragile setup steps? I accept, adapt, or reject each
suggestion and log the outcome in `code-review-notes.md` and `review-fixes.md`.

## 10. What information I avoid sharing unnecessarily with AI tools

Real secrets, credentials, tokens, private keys, customer/PII data, and internal-only
identifiers. The repo commits only `.env.example` with placeholders; real `.env` files and
`*.db` are git-ignored.

## 11. How I would reuse this workflow in a real project

- Keep a persistent project-context + rules set the tool reads before acting.
- Drive work spec-first, generate in small reviewable slices, and gate acceptance on
  build + tests + a manual critical check.
- Maintain a grouped prompt history so decisions and corrections are traceable.
