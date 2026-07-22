import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Deterministic seed: wipes and repopulates so the dataset is predictable for
// demos and tests. Covers every status and priority so search, filter, and the
// state machine are immediately demonstrable.
async function main() {
  console.log("Seeding database...");

  // Clean slate (respecting FK order).
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({
      data: { name: "Alice Nguyen", email: "alice@support.local", role: "ADMIN" },
    }),
    prisma.user.create({
      data: { name: "Bob Martins", email: "bob@support.local", role: "AGENT" },
    }),
    prisma.user.create({
      data: { name: "Carol Perez", email: "carol@support.local", role: "AGENT" },
    }),
    prisma.user.create({
      data: { name: "Dave Okafor", email: "dave@support.local", role: "AGENT" },
    }),
  ]);

  const tickets = [
    {
      title: "Login page returns 500 error",
      description:
        "Users report an intermittent 500 error when submitting the login form during peak hours.",
      priority: "HIGH",
      status: "OPEN",
      createdBy: alice.id,
      assignedTo: bob.id,
    },
    {
      title: "Export to CSV missing last row",
      description:
        "The CSV export omits the final record when the table has an odd number of rows.",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      createdBy: bob.id,
      assignedTo: carol.id,
    },
    {
      title: "Dark mode contrast on dashboard",
      description:
        "Several dashboard widgets have low text contrast in dark mode, failing accessibility checks.",
      priority: "LOW",
      status: "RESOLVED",
      createdBy: carol.id,
      assignedTo: dave.id,
    },
    {
      title: "Password reset email not delivered",
      description:
        "Password reset emails are not arriving for some corporate domains. Likely SPF/DKIM related.",
      priority: "HIGH",
      status: "CLOSED",
      createdBy: dave.id,
      assignedTo: alice.id,
    },
    {
      title: "Duplicate notifications on mobile",
      description:
        "Push notifications are delivered twice on Android after the latest release.",
      priority: "MEDIUM",
      status: "CANCELLED",
      createdBy: alice.id,
      assignedTo: null,
    },
    {
      title: "Search ignores special characters",
      description:
        "Keyword search fails when the query contains characters like '#' or '&'.",
      priority: "MEDIUM",
      status: "OPEN",
      createdBy: bob.id,
      assignedTo: dave.id,
    },
    {
      title: "Slow report generation",
      description:
        "Monthly reports take over 40 seconds to generate for large accounts.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      createdBy: carol.id,
      assignedTo: bob.id,
    },
    {
      title: "Typo in onboarding tooltip",
      description: "The welcome tooltip reads 'Welcom' instead of 'Welcome'.",
      priority: "LOW",
      status: "OPEN",
      createdBy: dave.id,
      assignedTo: carol.id,
    },
  ];

  const created = [];
  for (const t of tickets) {
    created.push(await prisma.ticket.create({ data: t }));
  }

  // A few comments to show the thread on the detail view.
  await prisma.comment.createMany({
    data: [
      {
        ticketId: created[0].id,
        message: "Reproduced on staging. Investigating the auth service logs.",
        createdBy: bob.id,
      },
      {
        ticketId: created[0].id,
        message: "Looks like a connection pool exhaustion under load.",
        createdBy: alice.id,
      },
      {
        ticketId: created[1].id,
        message: "Off-by-one in the pagination boundary. Fix in progress.",
        createdBy: carol.id,
      },
      {
        ticketId: created[6].id,
        message: "Added an index on the reports table; measuring impact.",
        createdBy: bob.id,
      },
    ],
  });

  const userCount = await prisma.user.count();
  const ticketCount = await prisma.ticket.count();
  const commentCount = await prisma.comment.count();
  console.log(
    `Seed complete: ${userCount} users, ${ticketCount} tickets, ${commentCount} comments.`,
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
