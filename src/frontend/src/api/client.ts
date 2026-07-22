import type {
  Comment,
  Ticket,
  TicketPriority,
  TicketStatus,
  UserRef,
} from "../types";

const BASE = "/api";

// Thrown for any non-2xx response. Carries the server's error code + message so
// the UI can show meaningful, backend-driven error states.
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body?.error ?? {};
    throw new ApiRequestError(
      res.status,
      err.code ?? "UNKNOWN",
      err.message ?? "Request failed",
      err.details,
    );
  }
  return body as T;
}

export interface ListParams {
  q?: string;
  status?: TicketStatus | "";
}

export const api = {
  listUsers: () => request<UserRef[]>("/users"),

  listTickets: ({ q, status }: ListParams) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const qs = params.toString();
    return request<Ticket[]>(`/tickets${qs ? `?${qs}` : ""}`);
  },

  getTicket: (id: string) => request<Ticket>(`/tickets/${id}`),

  createTicket: (data: {
    title: string;
    description: string;
    priority: TicketPriority;
    createdBy: string;
    assignedTo?: string | null;
  }) =>
    request<Ticket>("/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTicket: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      priority: TicketPriority;
      assignedTo: string | null;
    }>,
  ) =>
    request<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changeStatus: (id: string, status: TicketStatus) =>
    request<Ticket>(`/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addComment: (id: string, data: { message: string; createdBy: string }) =>
    request<Comment>(`/tickets/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
