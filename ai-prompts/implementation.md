# AI Prompts — Implementation

## Prompt 1 (state machine module)
"Generate a single TypeScript module that defines the allowed ticket status transitions
and helpers `canTransition`, `getAllowedTransitions`, `isTerminalStatus`. It must be the
only place transition rules live."

- Response summary: `ALLOWED_TRANSITIONS` map + helpers.
- Accepted: as the single source of truth (`lib/stateMachine.ts`), also exposed via `/api/meta/transitions`.
- Changed: added an explicit terminal-state helper used by the UI.

## Prompt 2 (status route)
"Implement `PATCH /tickets/:id/status`. Read the current status from the DB, reject
same-status and illegal transitions with 409 including `{from,to,allowed}`, and only then
persist."

- Response summary: handler that loads the ticket, validates the target status via Zod,
  checks `canTransition`, and updates.
- Accepted: with the DB-first check so the client cannot assert its own current status.
- Changed: added the explicit same-status -> 409 branch.

## Prompt 3 (React detail view)
"Build the ticket detail page: inline edit form, assignee dropdown, status transition
buttons rendered from the backend's `allowedTransitions`, and a comment thread + form.
Use TanStack Query and invalidate after each mutation."

- Response summary: `TicketDetailPage` with mutations for update/status/comment.
- Accepted: rendering only allowed transitions; surfacing backend errors via toasts.
- Changed: ensured every mutation refetches so the UI always reflects authoritative state.
