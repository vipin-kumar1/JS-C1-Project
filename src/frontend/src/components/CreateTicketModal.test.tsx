import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTicketModal } from "./CreateTicketModal";
import { mockUsers, renderWithProviders } from "../test/utils";

// Mock the API module used by both the modal and the CurrentUser provider.
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

describe("CreateTicketModal", () => {
  it("shows validation errors and does not call the API when required fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateTicketModal onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /create ticket/i }));

    expect(
      await screen.findByText(/title must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/description must be at least 5 characters/i),
    ).toBeInTheDocument();
    expect(mockApi.createTicket).not.toHaveBeenCalled();
  });

  it("submits valid input and closes on success", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockApi.createTicket.mockResolvedValue({} as never);

    renderWithProviders(<CreateTicketModal onClose={onClose} />);

    // Wait until the acting user is loaded (assignee options rendered).
    await screen.findByRole("option", { name: "Alice Nguyen" });

    await user.type(
      screen.getByPlaceholderText(/short summary of the issue/i),
      "Cannot log in",
    );
    await user.type(
      screen.getByPlaceholderText(/steps to reproduce/i),
      "Login button does nothing when clicked",
    );

    await user.click(screen.getByRole("button", { name: /create ticket/i }));

    await waitFor(() => expect(mockApi.createTicket).toHaveBeenCalledTimes(1));
    expect(mockApi.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Cannot log in",
        description: "Login button does nothing when clicked",
        priority: "MEDIUM",
        createdBy: "u1",
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("surfaces a backend error without closing", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { ApiRequestError } = await import("../api/client");
    mockApi.createTicket.mockRejectedValue(
      new ApiRequestError(400, "VALIDATION_ERROR", "Title already exists"),
    );

    renderWithProviders(<CreateTicketModal onClose={onClose} />);
    await screen.findByRole("option", { name: "Alice Nguyen" });

    await user.type(
      screen.getByPlaceholderText(/short summary of the issue/i),
      "Cannot log in",
    );
    await user.type(
      screen.getByPlaceholderText(/steps to reproduce/i),
      "Login button does nothing",
    );
    await user.click(screen.getByRole("button", { name: /create ticket/i }));

    expect(await screen.findByText(/title already exists/i)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
