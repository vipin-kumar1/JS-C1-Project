# AI Prompts — Documentation

## Prompt 1 (README)
"Draft a README that lets someone set up and run the backend and frontend from scratch on
a fresh machine, including Prisma generate/migrate/seed and how to run the tests."

- Response summary: step-by-step setup for both apps + test commands + project structure.
- Accepted: the structure.
- Changed: split seeding into its own step (see `debugging-notes.md`) and added a
  troubleshooting note about the EPERM seed error.

## Prompt 2 (artifacts consistency)
"Given the code, generate accurate `api-contract.md` and `data-model.md` that match the
actual routes, schemas, and Prisma models."

- Response summary: endpoint table with request/response/validation/errors; entity tables
  + ER diagram.
- Accepted: after cross-checking each endpoint and field against the source.
- Changed: corrected error codes to match the real handler (409 for invalid transitions).

## Prompt 3 (traceability)
"Help ensure acceptance criteria map 1:1 to features and tests."

- Response summary: checklist mapping each Core criterion to the implementing route/page
  and the covering test.
- Accepted: recorded in `acceptance-criteria.md`.
