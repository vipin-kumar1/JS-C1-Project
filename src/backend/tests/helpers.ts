import { prisma } from "../src/lib/prisma.js";
import type { TicketStatus, TicketPriority } from "../src/lib/domain.js";

// Wipes all rows and seeds two users. Called in beforeEach so every test runs
// against a known, isolated dataset.
export async function resetDb() {
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const reporter = await prisma.user.create({
    data: { name: "Reporter", email: "reporter@test.local", role: "AGENT" },
  });
  const assignee = await prisma.user.create({
    data: { name: "Assignee", email: "assignee@test.local", role: "AGENT" },
  });
  return { reporter, assignee };
}

export async function createTicket(opts: {
  createdBy: string;
  assignedTo?: string | null;
  status?: TicketStatus;
  priority?: TicketPriority;
  title?: string;
  description?: string;
}) {
  return prisma.ticket.create({
    data: {
      title: opts.title ?? "Sample ticket",
      description: opts.description ?? "A sample description",
      priority: opts.priority ?? "MEDIUM",
      status: opts.status ?? "OPEN",
      createdBy: opts.createdBy,
      assignedTo: opts.assignedTo ?? null,
    },
  });
}
