import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createTicket, resetDb } from "./helpers.js";

const app = createApp();

let reporterId: string;
let assigneeId: string;

beforeEach(async () => {
  const { reporter, assignee } = await resetDb();
  reporterId = reporter.id;
  assigneeId = assignee.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/tickets (create + validation)", () => {
  it("creates a ticket with valid input", async () => {
    const res = await request(app).post("/api/tickets").send({
      title: "Cannot log in",
      description: "Login button does nothing",
      priority: "HIGH",
      createdBy: reporterId,
      assignedTo: assigneeId,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("OPEN");
    expect(res.body.assignee.id).toBe(assigneeId);
    expect(res.body.allowedTransitions).toEqual(["IN_PROGRESS", "CANCELLED"]);
  });

  it("rejects missing title with 400", async () => {
    const res = await request(app).post("/api/tickets").send({
      description: "No title here",
      createdBy: reporterId,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a non-existent createdBy user with 400", async () => {
    const res = await request(app).post("/api/tickets").send({
      title: "Valid title",
      description: "Valid description",
      createdBy: "does-not-exist",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("PATCH /api/tickets/:id/status (state machine)", () => {
  const validCases: Array<[string, string]> = [
    ["OPEN", "IN_PROGRESS"],
    ["IN_PROGRESS", "RESOLVED"],
    ["RESOLVED", "CLOSED"],
    ["OPEN", "CANCELLED"],
    ["IN_PROGRESS", "CANCELLED"],
  ];

  it.each(validCases)("allows %s -> %s", async (from, to) => {
    const ticket = await createTicket({
      createdBy: reporterId,
      status: from as any,
    });
    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}/status`)
      .send({ status: to });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(to);
  });

  const invalidCases: Array<[string, string]> = [
    ["OPEN", "RESOLVED"],
    ["OPEN", "CLOSED"],
    ["IN_PROGRESS", "CLOSED"],
    ["RESOLVED", "IN_PROGRESS"],
    ["CLOSED", "OPEN"],
    ["CANCELLED", "IN_PROGRESS"],
  ];

  it.each(invalidCases)("rejects %s -> %s with 409", async (from, to) => {
    const ticket = await createTicket({
      createdBy: reporterId,
      status: from as any,
    });
    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}/status`)
      .send({ status: to });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVALID_TRANSITION");

    // Confirm the ticket status did not change in the database.
    const unchanged = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(unchanged?.status).toBe(from);
  });

  it("rejects transitioning to the same status with 409", async () => {
    const ticket = await createTicket({ createdBy: reporterId, status: "OPEN" });
    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}/status`)
      .send({ status: "OPEN" });
    expect(res.status).toBe(409);
  });

  it("rejects an unknown status value with 400", async () => {
    const ticket = await createTicket({ createdBy: reporterId, status: "OPEN" });
    const res = await request(app)
      .patch(`/api/tickets/${ticket.id}/status`)
      .send({ status: "BOGUS" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing ticket", async () => {
    const res = await request(app)
      .patch(`/api/tickets/missing-id/status`)
      .send({ status: "IN_PROGRESS" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/tickets (search + filter)", () => {
  beforeEach(async () => {
    await createTicket({
      createdBy: reporterId,
      title: "Payment gateway timeout",
      description: "Checkout fails intermittently",
      status: "OPEN",
    });
    await createTicket({
      createdBy: reporterId,
      title: "UI alignment issue",
      description: "Sidebar overlaps content",
      status: "IN_PROGRESS",
    });
    await createTicket({
      createdBy: reporterId,
      title: "Payment refund bug",
      description: "Refund amount incorrect",
      status: "RESOLVED",
    });
  });

  it("filters by status", async () => {
    const res = await request(app).get("/api/tickets?status=OPEN");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe("OPEN");
  });

  it("searches by keyword in title/description", async () => {
    const res = await request(app).get("/api/tickets?q=payment");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("combines keyword and status filter", async () => {
    const res = await request(app).get("/api/tickets?q=payment&status=RESOLVED");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Payment refund bug");
  });
});

describe("comments and detail", () => {
  it("adds a comment and returns it in the detail view", async () => {
    const ticket = await createTicket({ createdBy: reporterId });
    const add = await request(app)
      .post(`/api/tickets/${ticket.id}/comments`)
      .send({ message: "Looking into this", createdBy: assigneeId });
    expect(add.status).toBe(201);

    const detail = await request(app).get(`/api/tickets/${ticket.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.comments).toHaveLength(1);
    expect(detail.body.comments[0].message).toBe("Looking into this");
  });

  it("rejects an empty comment with 400", async () => {
    const ticket = await createTicket({ createdBy: reporterId });
    const res = await request(app)
      .post(`/api/tickets/${ticket.id}/comments`)
      .send({ message: "", createdBy: assigneeId });
    expect(res.status).toBe(400);
  });
});
