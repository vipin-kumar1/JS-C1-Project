# AI Prompts — Planning

## Prompt 1 (context setting + scope)
"We're building the Core of a Support Ticket Management System (entities User, Ticket,
Comment; enforced status state machine). Stack: React+Vite+TS, Express+TS, SQLite+Prisma.
Propose a task breakdown with milestones and a risk/mitigation table. Backend and the
state machine are the priority."

- Response summary: Task list (scaffold -> DB -> state machine -> API -> UI -> tests ->
  docs -> verify), milestones M1-M4, risks (logic drift, client bypass, SQLite case
  sensitivity, weak seed, committed secrets) with mitigations.
- Accepted: the overall ordering and the risk list.
- Changed: made "backend + state machine + tests green" the first milestone so the
  hardest logic is proven before UI work.
- Rejected: nothing significant.

## Prompt 2 (sequencing decision)
"Should status changes go through the generic ticket update endpoint or a dedicated one?"

- Response summary: recommended a dedicated `PATCH /:id/status` so transition rules are
  enforced in one place and the generic update cannot accidentally change status.
- Accepted: dedicated status endpoint.
- Rationale recorded in `design-notes.md` and `api-contract.md`.
