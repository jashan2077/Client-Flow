import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const projects = await prisma.project.findMany({
    where: { agencyId },
    include: {
      client: { select: { companyName: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const body = await req.json();
  const { name, description, clientId, projectManagerId, priority, startDate, endDate } = body;

  if (!name || !clientId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure client belongs to this agency
  const client = await prisma.client.findFirst({
    where: { id: clientId, agencyId },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      agencyId,
      clientId,
      name,
      description,
      priority: priority || "MEDIUM",
      projectManagerId: projectManagerId || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  // Create default milestones
  const defaultMilestones = [
    { title: "Planning", order: 1 },
    { title: "Design", order: 2 },
    { title: "Development", order: 3 },
    { title: "Testing", order: 4 },
    { title: "Client Review", order: 5 },
  ];

  await prisma.milestone.createMany({
    data: defaultMilestones.map((m) => ({
      projectId: project.id,
      ...m,
    })),
  });

  await prisma.activityLog.create({
    data: {
      agencyId,
      userId: session.user.id,
      action: "PROJECT_CREATED",
      entityType: "Project",
      entityId: project.id,
      metadata: { name, clientId },
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
