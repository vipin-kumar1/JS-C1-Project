import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TicketListPage } from "./TicketListPage";
import { makeTicket, mockUsers, renderWithProviders } from "../test/utils";

vi.mock("../api/client", () => {
  class ApiRequestError extends Error {
    constructor(
      public status: number,
      public code: string,
      message: string,
    ) {
      super(message);
    }
  }
  return {
    ApiRequestError,
    api: {
      listUsers: vi.fn(),
      listTickets: vi.fn(),
      createTicket: vi.fn(),
    },
  };
});

import { api } from "../api/client";

const mockApi = vi.mocked(api, true);

beforeEach(() => {
  vi.clearAllMocks();
  mockApi.listUsers.mockResolvedValue(mockUsers);
});

describe("TicketListPage", () => {
  it("renders tickets returned by the API", async () => {
    mockApi.listTickets.mockResolvedValue([
      makeTicket({ id: "t1", title: "Login page returns 500 error" }),
      makeTicket({ id: "t2", title: "Export to CSV missing last row", status: "IN_PROGRESS" }),
    ]);

    renderWithProviders(<TicketListPage />);

    expect(
      await screen.findByText("Login page returns 500 error"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Export to CSV missing last row"),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no tickets", async () => {
    mockApi.listTickets.mockResolvedValue([]);
    renderWithProviders(<TicketListPage />);
    expect(
      await screen.findByText(/no tickets match your filters/i),
    ).toBeInTheDocument();
  });

  it("filters by status when a chip is clicked", async () => {
    mockApi.listTickets.mockResolvedValue([makeTicket()]);
    const user = userEvent.setup();
    renderWithProviders(<TicketListPage />);

    await screen.findByText("Login page returns 500 error");
    expect(mockApi.listTickets).toHaveBeenLastCalledWith({ q: "", status: "" });

    const filters = screen.getByRole("group", { name: /filter by status/i });
    await user.click(within(filters).getByRole("button", { name: "Open" }));

    await waitFor(() =>
      expect(mockApi.listTickets).toHaveBeenLastCalledWith({
        q: "",
        status: "OPEN",
      }),
    );
  });

  it("issues a debounced keyword search", async () => {
    mockApi.listTickets.mockResolvedValue([makeTicket()]);
    const user = userEvent.setup();
    renderWithProviders(<TicketListPage />);

    await screen.findByText("Login page returns 500 error");
    await user.type(screen.getByLabelText(/search tickets/i), "login");

    await waitFor(
      () =>
        expect(mockApi.listTickets).toHaveBeenLastCalledWith({
          q: "login",
          status: "",
        }),
      { timeout: 2000 },
    );
  });
});
