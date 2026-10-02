import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientId = session.user.clientId!;
  const { projectId, content } = await req.json();

  if (!projectId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure project belongs to this client
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const feedback = await prisma.feedback.create({
    data: { projectId, clientId, content },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { clientId: session.user.clientId! },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ feedbacks });
}
