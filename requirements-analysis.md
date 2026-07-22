# Requirement Analysis

## Selected Project Option

Support Ticket Management System (Backend-heavy option). Building the mandatory Core
plus the full set of lifecycle documentation artifacts. Stretch features (auth, RBAC,
Docker, CI, Swagger, pagination) are intentionally out of scope for this submission.

## My Understanding (in your own words)

Internal support staff need a lightweight tool to track support tickets from creation to
closure. A ticket has a title, description, priority, and a status that must move through
a controlled lifecycle. Staff can reassign tickets, edit their fields, and discuss them
via comments. They need to find tickets quickly by keyword and by status.

The hardest and most important part is the status lifecycle. It is not a free-form field:
only specific transitions are legal, and the backend must be the authority that enforces
them. The UI should make illegal actions impossible to trigger and should clearly explain
any rejection that still happens (e.g. a stale page).

## Functional Requirements

1. Create a ticket (title, description, priority, optional assignee).
2. List all tickets.
3. View a single ticket's details, including its comments.
4. Update a ticket's editable fields: title, description, priority, assignee.
5. Change status only via valid transitions (state machine).
6. Add comments to a ticket.
7. Keyword search across title and description.
8. Filter tickets by status.
9. Persist all data so it survives a server restart.
10. Validate required fields on the backend and reject invalid input.
11. Show meaningful loading, empty, and error states in the UI.

## Non-Functional Requirements

- Correctness of the state machine is paramount; it must be centrally defined and testable.
- The backend is the source of truth for validation and transitions; the client cannot bypass it.
- No secrets committed to the repo (`.env` is git-ignored; `.env.example` provided).
- Setup must run cleanly from the README on a fresh machine.
- Reasonable, modern, accessible UI with clear feedback.
- Deterministic, repeatable seed data.

## Assumptions

- No authentication is required for Core. Because actions still need an acting user
  (createdBy, comment author), the UI provides an "Acting as" user selector backed by
  the seeded users. This is a deliberate stand-in for auth, documented as such.
- Users are seeded only; there is no user-management UI (per the spec).
- `CLOSED` and `CANCELLED` are terminal states with no outgoing transitions.
- Priority is one of LOW / MEDIUM / HIGH; status is one of OPEN / IN_PROGRESS /
  RESOLVED / CLOSED / CANCELLED.
- Search is a case-insensitive substring match on title and description (SQLite LIKE).

## Clarifications (questions for a product owner)

1. Should re-opening a ticket (e.g. CLOSED -> OPEN) ever be allowed? (Assumed: no.)
2. Should transitioning a ticket to the same status be a no-op or an error? (Assumed: error / 409.)
3. Can a ticket be created directly in a non-OPEN status? (Assumed: no; always starts OPEN.)
4. Is assignee required at creation? (Assumed: optional; may be unassigned.)
5. Should comments be editable/deletable? (Assumed: no; append-only for Core.)

## Edge Cases

- Invalid status transition (e.g. OPEN -> RESOLVED) -> 409, no state change.
- Transition to the current status -> 409.
- Unknown status string in request body -> 400 (validation).
- Missing/short title or description on create -> 400.
- `createdBy` / `assignedTo` referencing a non-existent user -> 400.
- Empty comment message -> 400.
- Requesting a non-existent ticket -> 404.
- Search/filter with no matches -> empty list + friendly empty state.
- Combined keyword + status filter must intersect, not union.
