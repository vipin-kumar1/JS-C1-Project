import type { TicketStatus } from "./domain.js";

// The signature judgment piece: the enforced ticket-status state machine.
//
//   OPEN         -> IN_PROGRESS, CANCELLED
//   IN_PROGRESS  -> RESOLVED, CANCELLED
//   RESOLVED     -> CLOSED
//   CLOSED       -> (terminal)
//   CANCELLED    -> (terminal)
//
// Any transition not listed here is invalid and must be rejected by the
// backend. This map is the single source of truth used by both the API and
// the frontend (the frontend fetches allowed transitions to render only
// valid actions).
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export function getAllowedTransitions(from: TicketStatus): TicketStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export function canTransition(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return getAllowedTransitions(from).includes(to);
}

export function isTerminalStatus(status: TicketStatus): boolean {
  return getAllowedTransitions(status).length === 0;
}
