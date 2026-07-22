import { describe, expect, it } from "vitest";
import {
  canTransition,
  getAllowedTransitions,
  isTerminalStatus,
} from "../src/lib/stateMachine.js";

// Pure unit tests over the state-machine rules (no DB).
describe("state machine rules", () => {
  it("allows the defined valid transitions", () => {
    expect(canTransition("OPEN", "IN_PROGRESS")).toBe(true);
    expect(canTransition("OPEN", "CANCELLED")).toBe(true);
    expect(canTransition("IN_PROGRESS", "RESOLVED")).toBe(true);
    expect(canTransition("IN_PROGRESS", "CANCELLED")).toBe(true);
    expect(canTransition("RESOLVED", "CLOSED")).toBe(true);
  });

  it("rejects transitions not in the map", () => {
    expect(canTransition("OPEN", "RESOLVED")).toBe(false);
    expect(canTransition("OPEN", "CLOSED")).toBe(false);
    expect(canTransition("IN_PROGRESS", "CLOSED")).toBe(false);
    expect(canTransition("RESOLVED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("CLOSED", "OPEN")).toBe(false);
    expect(canTransition("CANCELLED", "OPEN")).toBe(false);
  });

  it("treats CLOSED and CANCELLED as terminal", () => {
    expect(isTerminalStatus("CLOSED")).toBe(true);
    expect(isTerminalStatus("CANCELLED")).toBe(true);
    expect(isTerminalStatus("OPEN")).toBe(false);
  });

  it("exposes allowed transitions per status", () => {
    expect(getAllowedTransitions("OPEN")).toEqual(["IN_PROGRESS", "CANCELLED"]);
    expect(getAllowedTransitions("CLOSED")).toEqual([]);
  });
});
