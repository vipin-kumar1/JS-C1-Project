import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import type { TicketStatus } from "../lib/domain.js";
import {
  InvalidTransitionError,
  NotFoundError,
  ValidationError,
} from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import {
  canTransition,
  getAllowedTransitions,
} from "../lib/stateMachine.js";
import {
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateStatusSchema,
  updateTicketSchema,
} from "../lib/validation.js";

export const ticketsRouter = Router();

const ticketInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
} as const;

// Verifies a referenced user exists; throws a 400 if not.
async function assertUserExists(userId: string, field: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ValidationError(`${field} references a non-existent user`, {
      field,
      value: userId,
    });
  }
}

// Attaches the list of currently-allowed next statuses so the frontend can
// render only valid actions.
function withAllowedTransitions<T extends { status: string }>(ticket: T) {
  return {
    ...ticket,
    allowedTransitions: getAllowedTransitions(ticket.status as TicketStatus),
  };
}

// GET /api/tickets?q=&status= - list with keyword search + status filter.
ticketsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, status } = listTicketsQuerySchema.parse(req.query);

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      include: ticketInclude,
      orderBy: { updatedAt: "desc" },
    });

    res.json(tickets.map(withAllowedTransitions));
  }),
);

// GET /api/tickets/:id - detail with comments.
ticketsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        ...ticketInclude,
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });
    if (!ticket) throw new NotFoundError("Ticket not found");
    res.json(withAllowedTransitions(ticket));
  }),
);

// POST /api/tickets - create.
ticketsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createTicketSchema.parse(req.body);
    await assertUserExists(data.createdBy, "createdBy");
    if (data.assignedTo) await assertUserExists(data.assignedTo, "assignedTo");

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo ?? null,
        status: "OPEN",
      },
      include: ticketInclude,
    });
    res.status(201).json(withAllowedTransitions(ticket));
  }),
);

// PATCH /api/tickets/:id - update editable fields (not status).
ticketsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateTicketSchema.parse(req.body);
    const existing = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new NotFoundError("Ticket not found");

    if (data.assignedTo) await assertUserExists(data.assignedTo, "assignedTo");

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.assignedTo !== undefined
          ? { assignedTo: data.assignedTo }
          : {}),
      },
      include: ticketInclude,
    });
    res.json(withAllowedTransitions(ticket));
  }),
);

// PATCH /api/tickets/:id/status - state-machine-enforced status change.
ticketsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status: nextStatus } = updateStatusSchema.parse(req.body);
    const existing = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new NotFoundError("Ticket not found");

    const currentStatus = existing.status as TicketStatus;

    if (currentStatus === nextStatus) {
      throw new InvalidTransitionError(
        `Ticket is already in status ${currentStatus}`,
        { from: currentStatus, to: nextStatus },
      );
    }

    if (!canTransition(currentStatus, nextStatus)) {
      throw new InvalidTransitionError(
        `Cannot transition from ${currentStatus} to ${nextStatus}`,
        {
          from: currentStatus,
          to: nextStatus,
          allowed: getAllowedTransitions(currentStatus),
        },
      );
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: nextStatus },
      include: ticketInclude,
    });
    res.json(withAllowedTransitions(ticket));
  }),
);

// POST /api/tickets/:id/comments - add a comment.
ticketsRouter.post(
  "/:id/comments",
  asyncHandler(async (req, res) => {
    const data = createCommentSchema.parse(req.body);
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });
    if (!ticket) throw new NotFoundError("Ticket not found");
    await assertUserExists(data.createdBy, "createdBy");

    const comment = await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        message: data.message,
        createdBy: data.createdBy,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    res.status(201).json(comment);
  }),
);
