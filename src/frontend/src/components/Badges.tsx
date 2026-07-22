import type { TicketPriority, TicketStatus } from "../types";
import { PRIORITY_LABELS, STATUS_LABELS } from "../lib/labels";

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`badge priority-${priority.toLowerCase()}`}>
      <span className="dot" aria-hidden />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
