export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface UserRef {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
  author?: { id: string; name: string };
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdBy: string;
  assignee: UserRef | null;
  creator: UserRef;
  createdAt: string;
  updatedAt: string;
  allowedTransitions: TicketStatus[];
  comments?: Comment[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }> | unknown;
  };
}
