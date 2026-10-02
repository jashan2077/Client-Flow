import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const project = await prisma.project.findFirst({
    where: { id: params.id, agencyId },
    include: { tasks: { include: { assignee: { select: { name: true } } } } },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ tasks: project.tasks });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  // Verify project belongs to agency
  const project = await prisma.project.findFirst({
    where: { id: params.id, agencyId },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, assigneeId, priority, dueDate } = body;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      projectId: params.id,
      title,
      description,
      assigneeId: assigneeId || null,
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });

  await prisma.activityLog.create({
    data: {
      agencyId,
      userId: session.user.id,
      action: "TASK_CREATED",
      entityType: "Task",
      entityId: task.id,
      metadata: { title, projectId: params.id },
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
