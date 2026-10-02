import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ClientFlow database...");

  // ───────────────────────────────────────────────
  // 1. Super Admin
  // ───────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@appzex.com" },
    update: {},
    create: {
      name: "ClientFlow Admin",
      email: "admin@appzex.com",
      hashedPassword: await bcrypt.hash("admin123", 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Super Admin created:", superAdmin.email);

  // ───────────────────────────────────────────────
  // 2. Agency 1 — Bright Media (ACTIVE)
  // ───────────────────────────────────────────────
  const agency1 = await prisma.agency.upsert({
    where: { email: "hello@brightmedia.com" },
    update: {},
    create: {
      name: "Bright Media Agency",
      ownerName: "Sarah Johnson",
      email: "hello@brightmedia.com",
      phone: "+1-555-0100",
      plan: "PRO",
      status: "ACTIVE",
    },
  });

  const a1Admin = await prisma.user.upsert({
    where: { email: "admin@brightmedia.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "admin@brightmedia.com",
      hashedPassword: await bcrypt.hash("agency123", 12),
      role: "AGENCY_ADMIN",
      agencyId: agency1.id,
    },
  });

  const a1Team1 = await prisma.user.upsert({
    where: { email: "alex@brightmedia.com" },
    update: {},
    create: {
      name: "Alex Turner",
      email: "alex@brightmedia.com",
      hashedPassword: await bcrypt.hash("team123", 12),
      role: "AGENCY_TEAM",
      agencyId: agency1.id,
    },
  });

  const a1Team2 = await prisma.user.upsert({
    where: { email: "jamie@brightmedia.com" },
    update: {},
    create: {
      name: "Jamie Lee",
      email: "jamie@brightmedia.com",
      hashedPassword: await bcrypt.hash("team123", 12),
      role: "AGENCY_TEAM",
      agencyId: agency1.id,
    },
  });

  // Clients for Agency 1
  const client1 = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      agencyId: agency1.id,
      companyName: "Acme Corporation",
      primaryContact: "Tom Brooks",
      email: "tom@acmecorp.com",
      phone: "+1-555-0200",
      notes: "Long-term enterprise client. Prefer weekly check-ins.",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "seed-client-2" },
    update: {},
    create: {
      id: "seed-client-2",
      agencyId: agency1.id,
      companyName: "NovaTech Solutions",
      primaryContact: "Lisa Park",
      email: "lisa@novatech.io",
      phone: "+1-555-0201",
    },
  });

  // Client users
  const clientUser1 = await prisma.user.upsert({
    where: { email: "client@acmecorp.com" },
    update: {},
    create: {
      name: "Tom Brooks",
      email: "client@acmecorp.com",
      hashedPassword: await bcrypt.hash("client123", 12),
      role: "CLIENT",
      agencyId: agency1.id,
      clientId: client1.id,
    },
  });

  const clientUser2 = await prisma.user.upsert({
    where: { email: "client@novatech.io" },
    update: {},
    create: {
      name: "Lisa Park",
      email: "client@novatech.io",
      hashedPassword: await bcrypt.hash("client123", 12),
      role: "CLIENT",
      agencyId: agency1.id,
      clientId: client2.id,
    },
  });

  // ── Projects for Client 1 (Acme) ──
  const project1 = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      agencyId: agency1.id,
      clientId: client1.id,
      name: "Acme Brand Refresh",
      description: "Full brand identity redesign including logo, guidelines, and collateral.",
      status: "ACTIVE",
      priority: "HIGH",
      projectManagerId: a1Admin.id,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-30"),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "seed-project-2" },
    update: {},
    create: {
      id: "seed-project-2",
      agencyId: agency1.id,
      clientId: client1.id,
      name: "Acme Website Redesign",
      description: "Corporate website redesign with CMS integration.",
      status: "ACTIVE",
      priority: "HIGH",
      projectManagerId: a1Team1.id,
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-08-31"),
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: "seed-project-3" },
    update: {},
    create: {
      id: "seed-project-3",
      agencyId: agency1.id,
      clientId: client1.id,
      name: "Acme Social Media Campaign",
      description: "Q2 social media strategy and content production.",
      status: "COMPLETED",
      priority: "MEDIUM",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-04-15"),
    },
  });

  // ── Projects for Client 2 (NovaTech) ──
  const project4 = await prisma.project.upsert({
    where: { id: "seed-project-4" },
    update: {},
    create: {
      id: "seed-project-4",
      agencyId: agency1.id,
      clientId: client2.id,
      name: "NovaTech Mobile App",
      description: "iOS and Android app for field service management.",
      status: "ACTIVE",
      priority: "HIGH",
      projectManagerId: a1Team2.id,
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-10-31"),
    },
  });

  const project5 = await prisma.project.upsert({
    where: { id: "seed-project-5" },
    update: {},
    create: {
      id: "seed-project-5",
      agencyId: agency1.id,
      clientId: client2.id,
      name: "NovaTech SEO Optimization",
      description: "Technical SEO audit and implementation.",
      status: "ON_HOLD",
      priority: "LOW",
    },
  });

  const project6 = await prisma.project.upsert({
    where: { id: "seed-project-6" },
    update: {},
    create: {
      id: "seed-project-6",
      agencyId: agency1.id,
      clientId: client2.id,
      name: "NovaTech Email Marketing",
      description: "Monthly newsletter design and automation setup.",
      status: "ACTIVE",
      priority: "MEDIUM",
    },
  });

  // Milestones for project1
  const milestoneData = [
    { title: "Planning", order: 1, status: "COMPLETED" as const },
    { title: "Design", order: 2, status: "COMPLETED" as const },
    { title: "Development", order: 3, status: "IN_PROGRESS" as const },
    { title: "Testing", order: 4, status: "PENDING" as const },
    { title: "Client Review", order: 5, status: "PENDING" as const },
  ];

  for (const p of [project1, project2, project4]) {
    const existing = await prisma.milestone.count({ where: { projectId: p.id } });
    if (existing === 0) {
      await prisma.milestone.createMany({
        data: milestoneData.map((m) => ({ ...m, projectId: p.id })),
      });
    }
  }

  // Tasks for project1
  const taskData = [
    { title: "Audit existing brand assets", status: "DONE" as const, priority: "HIGH" as const, assigneeId: a1Team1.id },
    { title: "Competitor brand analysis", status: "DONE" as const, priority: "MEDIUM" as const, assigneeId: a1Team1.id },
    { title: "Logo concept sketches", status: "DONE" as const, priority: "HIGH" as const, assigneeId: a1Team2.id },
    { title: "Color palette selection", status: "IN_PROGRESS" as const, priority: "HIGH" as const, assigneeId: a1Team2.id },
    { title: "Typography system", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, assigneeId: a1Team1.id },
    { title: "Brand guidelines document", status: "TODO" as const, priority: "HIGH" as const, assigneeId: a1Team2.id },
    { title: "Stationery design", status: "TODO" as const, priority: "LOW" as const },
    { title: "Client presentation", status: "TODO" as const, priority: "HIGH" as const, assigneeId: a1Admin.id },
  ];

  const existingTasks1 = await prisma.task.count({ where: { projectId: project1.id } });
  if (existingTasks1 === 0) {
    for (const t of taskData) {
      await prisma.task.create({
        data: {
          ...t,
          projectId: project1.id,
          dueDate: new Date("2024-06-01"),
        },
      });
    }
  }

  // Tasks for project4
  const taskData4 = [
    { title: "Requirements gathering", status: "DONE" as const, priority: "HIGH" as const },
    { title: "UI/UX wireframes", status: "DONE" as const, priority: "HIGH" as const, assigneeId: a1Team2.id },
    { title: "Backend API design", status: "IN_PROGRESS" as const, priority: "HIGH" as const, assigneeId: a1Team1.id },
    { title: "Authentication module", status: "TODO" as const, priority: "HIGH" as const, assigneeId: a1Team1.id },
    { title: "Dashboard screen", status: "TODO" as const, priority: "MEDIUM" as const, assigneeId: a1Team2.id },
  ];

  const existingTasks4 = await prisma.task.count({ where: { projectId: project4.id } });
  if (existingTasks4 === 0) {
    for (const t of taskData4) {
      await prisma.task.create({
        data: { ...t, projectId: project4.id, dueDate: new Date("2024-09-30") },
      });
    }
  }

  // Meetings
  const existingMeetings = await prisma.meeting.count({ where: { projectId: project1.id } });
  if (existingMeetings === 0) {
    await prisma.meeting.createMany({
      data: [
        {
          projectId: project1.id,
          title: "Kickoff Meeting",
          notes: "Discussed project goals and timeline. Client approved initial scope.",
          date: new Date("2024-01-10"),
        },
        {
          projectId: project1.id,
          title: "Design Review",
          notes: "Presented logo concepts. Client prefers Option B with blue palette.",
          date: new Date("2024-03-15"),
        },
      ],
    });
  }

  // Feedback
  const existingFeedback = await prisma.feedback.count({ where: { projectId: project1.id } });
  if (existingFeedback === 0) {
    await prisma.feedback.createMany({
      data: [
        {
          projectId: project1.id,
          clientId: client1.id,
          content: "The logo direction looks great! Please increase the font size slightly for the tagline.",
          status: "IN_REVIEW",
        },
        {
          projectId: project4.id,
          clientId: client2.id,
          content: "Can we add an offline mode to the mobile app? Technicians often work in low-signal areas.",
          status: "OPEN",
        },
      ],
    });
  }

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        agencyId: agency1.id,
        userId: a1Admin.id,
        action: "PROJECT_CREATED",
        entityType: "Project",
        entityId: project1.id,
        metadata: { name: "Acme Brand Refresh" },
      },
      {
        agencyId: agency1.id,
        userId: a1Admin.id,
        action: "CLIENT_CREATED",
        entityType: "Client",
        entityId: client1.id,
        metadata: { companyName: "Acme Corporation" },
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Agency 1 (Bright Media) seeded successfully");

  // ───────────────────────────────────────────────
  // 3. Agency 2 — Stellar Design (SUSPENDED)
  // ───────────────────────────────────────────────
  const agency2 = await prisma.agency.upsert({
    where: { email: "hello@stellardesign.co" },
    update: {},
    create: {
      name: "Stellar Design Co",
      ownerName: "Marcus Webb",
      email: "hello@stellardesign.co",
      phone: "+1-555-0300",
      plan: "STARTER",
      status: "SUSPENDED",
    },
  });

  const a2Admin = await prisma.user.upsert({
    where: { email: "admin@stellardesign.co" },
    update: {},
    create: {
      name: "Marcus Webb",
      email: "admin@stellardesign.co",
      hashedPassword: await bcrypt.hash("agency123", 12),
      role: "AGENCY_ADMIN",
      agencyId: agency2.id,
    },
  });

  const a2Team1 = await prisma.user.upsert({
    where: { email: "nina@stellardesign.co" },
    update: {},
    create: {
      name: "Nina Roberts",
      email: "nina@stellardesign.co",
      hashedPassword: await bcrypt.hash("team123", 12),
      role: "AGENCY_TEAM",
      agencyId: agency2.id,
    },
  });

  const a2Team2 = await prisma.user.upsert({
    where: { email: "carlos@stellardesign.co" },
    update: {},
    create: {
      name: "Carlos Ruiz",
      email: "carlos@stellardesign.co",
      hashedPassword: await bcrypt.hash("team123", 12),
      role: "AGENCY_TEAM",
      agencyId: agency2.id,
    },
  });

  const client3 = await prisma.client.upsert({
    where: { id: "seed-client-3" },
    update: {},
    create: {
      id: "seed-client-3",
      agencyId: agency2.id,
      companyName: "BlueStar Retail",
      primaryContact: "Kim Nguyen",
      email: "kim@bluestar.com",
    },
  });

  const client4 = await prisma.client.upsert({
    where: { id: "seed-client-4" },
    update: {},
    create: {
      id: "seed-client-4",
      agencyId: agency2.id,
      companyName: "Pinnacle Hotels",
      primaryContact: "Daniel Ford",
      email: "daniel@pinnaclehotels.com",
    },
  });

  const clientUser3 = await prisma.user.upsert({
    where: { email: "client@bluestar.com" },
    update: {},
    create: {
      name: "Kim Nguyen",
      email: "client@bluestar.com",
      hashedPassword: await bcrypt.hash("client123", 12),
      role: "CLIENT",
      agencyId: agency2.id,
      clientId: client3.id,
    },
  });

  const clientUser4 = await prisma.user.upsert({
    where: { email: "client@pinnaclehotels.com" },
    update: {},
    create: {
      name: "Daniel Ford",
      email: "client@pinnaclehotels.com",
      hashedPassword: await bcrypt.hash("client123", 12),
      role: "CLIENT",
      agencyId: agency2.id,
      clientId: client4.id,
    },
  });

  // Projects for Agency 2
  for (const [idx, projectInfo] of [
    { id: "seed-project-7", clientId: client3.id, name: "BlueStar E-Commerce Site", status: "ACTIVE" as const, priority: "HIGH" as const },
    { id: "seed-project-8", clientId: client3.id, name: "BlueStar Instagram Strategy", status: "ACTIVE" as const, priority: "MEDIUM" as const },
    { id: "seed-project-9", clientId: client3.id, name: "BlueStar Email Campaigns", status: "COMPLETED" as const, priority: "LOW" as const },
    { id: "seed-project-10", clientId: client4.id, name: "Pinnacle Website", status: "ACTIVE" as const, priority: "HIGH" as const },
    { id: "seed-project-11", clientId: client4.id, name: "Pinnacle Brand Identity", status: "ON_HOLD" as const, priority: "MEDIUM" as const },
    { id: "seed-project-12", clientId: client4.id, name: "Pinnacle Ad Campaign", status: "CANCELLED" as const, priority: "LOW" as const },
  ].entries()) {
    await prisma.project.upsert({
      where: { id: projectInfo.id },
      update: {},
      create: {
        id: projectInfo.id,
        agencyId: agency2.id,
        clientId: projectInfo.clientId,
        name: projectInfo.name,
        status: projectInfo.status,
        priority: projectInfo.priority,
      },
    });
  }

  console.log("✅ Agency 2 (Stellar Design — SUSPENDED) seeded successfully");

  console.log("\n🎉 Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Super Admin:   admin@appzex.com        / admin123");
  console.log("  Agency Admin:  admin@brightmedia.com   / agency123");
  console.log("  Team Member:   alex@brightmedia.com    / team123");
  console.log("  Client:        client@acmecorp.com     / client123");
  console.log("  Client:        client@novatech.io      / client123");
  console.log("  (Suspended)    admin@stellardesign.co  / agency123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
