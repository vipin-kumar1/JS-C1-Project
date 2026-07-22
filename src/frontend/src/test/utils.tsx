import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { CurrentUserProvider } from "../context/CurrentUser";
import { ToastProvider } from "../context/Toast";
import type { Ticket, UserRef } from "../types";

// Fresh QueryClient per render with retries off so failing queries surface
// immediately in tests instead of retrying.
export function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface Options {
  route?: string;
  client?: QueryClient;
}

// Wraps a component in the same provider stack the real app uses.
export function renderWithProviders(ui: ReactElement, opts: Options = {}) {
  const client = opts.client ?? makeClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[opts.route ?? "/"]}>
          <ToastProvider>
            <CurrentUserProvider>{children}</CurrentUserProvider>
          </ToastProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { client, ...render(ui, { wrapper: Wrapper }) };
}

// --- Test data factories -------------------------------------------------

export const mockUsers: UserRef[] = [
  { id: "u1", name: "Alice Nguyen", email: "alice@test.local", role: "ADMIN" },
  { id: "u2", name: "Bob Martins", email: "bob@test.local", role: "AGENT" },
];

export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "t1",
    title: "Login page returns 500 error",
    description: "Intermittent 500 on login",
    priority: "HIGH",
    status: "OPEN",
    assignedTo: "u2",
    createdBy: "u1",
    assignee: mockUsers[1],
    creator: mockUsers[0],
    createdAt: new Date("2026-01-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-02T10:00:00Z").toISOString(),
    allowedTransitions: ["IN_PROGRESS", "CANCELLED"],
    comments: [],
    ...overrides,
  };
}
