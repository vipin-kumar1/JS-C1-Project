# AI Prompts — Code Review

## Prompt 1 (bypass + consistency + secrets)
"Critically review the backend for three things: (1) can the status state machine be
bypassed by a client? (2) are validation and error responses consistent? (3) are there
any secrets or fragile setup steps?"

- Response summary:
  - The status route reads the current status from the DB before deciding legality (good),
    but should also reject same-status explicitly.
  - Standardize on one error shape and map error types centrally (already the intent).
  - `.env` must be git-ignored; only commit `.env.example`.
- Accepted: added same-status -> 409; confirmed `.gitignore` excludes `.env` and `*.db`.
- Changed: enriched the 409 body with `{ from, to, allowed }`.

## Prompt 2 (search correctness)
"Should the search filter use Prisma's `mode: 'insensitive'`?"

- Response summary: not on SQLite (unsupported); ASCII `LIKE` is already case-insensitive.
- Rejected the suggestion; verified with a lowercase query returning a mixed-case title.

## Prompt 3 (frontend authority)
"Does the frontend ever decide transition legality on its own?"

- Response summary: it should render only the backend's `allowedTransitions` and always
  surface backend errors.
- Accepted: confirmed the detail page renders buttons from `allowedTransitions` and shows
  409 errors via toast, then refetches.
