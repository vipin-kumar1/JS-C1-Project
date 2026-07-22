// Shared domain constants for tickets. Kept in one place so validation,
// the state machine, and seed data cannot drift apart.

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    (TICKET_STATUSES as readonly string[]).includes(value)
  );
}

export function isTicketPriority(value: unknown): value is TicketPriority {
  return (
    typeof value === "string" &&
    (TICKET_PRIORITIES as readonly string[]).includes(value)
  );
}
