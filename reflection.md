# Reflection

## What I Built

A Core Support Ticket Management System: a React/Vite frontend, an Express/Prisma backend,
and SQLite persistence. The centerpiece is an enforced status state machine that the
backend validates and the frontend respects by only offering legal transitions. The app
supports create/list/view/update/comment, keyword search, and status filtering, with
backend validation and clear error states.

## How I Used AI (across the lifecycle)

- Requirement analysis: expanded the state-machine edge cases and drafted clarifying questions.
- Design: weighed persistence options and settled on SQLite for zero-config, restart-safe storage; shaped the REST contract.
- Implementation: generated boilerplate (Prisma schema, Express routes, Zod schemas, React components) and refined it.
- Testing: generated the valid/invalid transition matrix and validation/search cases.
- Debugging: interpreted an EPERM seed error and a React hook misuse.
- Review: ran a critical pass focused on bypass risks, error consistency, and secrets.

## What AI Helped With Most

- Quickly enumerating the full transition matrix (valid + invalid) so tests were exhaustive rather than happy-path only.
- Producing consistent boilerplate across layers, letting me focus on the state-machine correctness and error contract.
- Diagnosing the environmental seed failure as non-code (temp-dir IPC pipe) rather than chasing a phantom Prisma bug.

## What AI Got Wrong

- Initially proposed a debounce hook using `useMemo` with a cleanup return, which never clears the timer. I corrected it to `useEffect`.
- Suggested `mode: "insensitive"` for search, which SQLite does not support; I verified ASCII `LIKE` is already case-insensitive and dropped it.

## How I Validated AI Output

- Ran the type-checked build and the full test suite (26/26) after changes.
- Exercised the API directly with curl (valid/invalid transitions, validation, search) and the UI manually.
- Read each generated diff for correctness rather than accepting wholesale, especially around the state machine and error mapping.

## What I Would Improve Next

- Add frontend component/E2E tests and an OpenAPI spec.
- Add auth + RBAC and the remaining Stretch filters/sorting/pagination.
- Introduce Docker + CI so the whole thing is reproducible in one command.

## Reusable Workflow (prompts, rules, specs, templates)

- `tool-specific/cursor-workflow/` captures the persistent project context, spec, tasks, and rules I would reuse.
- `ai-prompts/` groups prompts by lifecycle activity as a reusable template for future projects.
- The pattern of a single state-machine module + exhaustive transition test matrix is directly reusable for any workflow/status feature.
