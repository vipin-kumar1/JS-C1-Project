import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriorityBadge, StatusBadge } from "./Badges";

describe("StatusBadge", () => {
  it("renders the human-readable label for each status", () => {
    const { rerender } = render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    rerender(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("applies a status-specific class", () => {
    render(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText("Resolved")).toHaveClass("badge", "status-resolved");
  });
});

describe("PriorityBadge", () => {
  it("renders the priority label and class", () => {
    render(<PriorityBadge priority="HIGH" />);
    const badge = screen.getByText("High");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("badge", "priority-high");
  });
});
