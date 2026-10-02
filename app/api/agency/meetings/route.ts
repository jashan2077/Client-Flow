import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const { title, projectId, date, notes } = await req.json();

  if (!title || !projectId || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({ where: { id: projectId, agencyId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const meeting = await prisma.meeting.create({
    data: { projectId, title, notes, date: new Date(date) },
  });

  return NextResponse.json({ meeting }, { status: 201 });
}
