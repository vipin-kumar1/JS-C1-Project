import { z } from "zod";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "./domain.js";

// Zod schemas define the API's input contract. They run before any DB access
// so invalid records are rejected at the boundary.

export const createTicketSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(5000),
  priority: z.enum(TICKET_PRIORITIES).default("MEDIUM"),
  createdBy: z.string().min(1, "createdBy is required"),
  assignedTo: z.string().min(1).nullable().optional(),
});

export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(3).max(140).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assignedTo: z.string().min(1).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});

export const createCommentSchema = z.object({
  message: z.string().trim().min(1, "Comment message cannot be empty").max(2000),
  createdBy: z.string().min(1, "createdBy is required"),
});

export const listTicketsQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(TICKET_STATUSES).optional(),
});
