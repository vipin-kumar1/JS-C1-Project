# AI Prompts — Debugging

## Prompt 1 (EPERM during seed)
"`prisma migrate dev` created the migration but the seed step failed:
`EPERM ... listen ... tsx-501/<pid>.pipe`. What's going on and how do I fix it?"

- Response summary: the failure is `tsx` trying to create an IPC named pipe in the OS
  temp dir; it's an environment/permissions restriction, not a Prisma or seed-script bug.
- Accepted: the diagnosis.
- Action taken: ran `npx tsx prisma/seed.ts` directly (succeeded: 4 users, 8 tickets, 4
  comments) and documented seeding as a separate README step.
- Validated: queried the API and confirmed the DB was populated.

## Prompt 2 (React hook misuse)
"Review this `useDebounced` hook — it uses `useMemo` and returns a cleanup function."

- Response summary: `useMemo` does not run cleanups, so the timer never clears; use
  `useEffect` for the side effect + cleanup.
- Accepted: rewrote with `useEffect` + `clearTimeout`.
- Validated: `npm run build` passes; search debouncing works in the browser.
