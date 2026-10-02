import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const members = await prisma.user.findMany({
    where: { agencyId, role: { in: ["AGENCY_ADMIN", "AGENCY_TEAM"] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role !== "AGENCY_ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const body = await req.json();
  const { name, email, role, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: role === "AGENCY_ADMIN" ? "AGENCY_ADMIN" : "AGENCY_TEAM",
      agencyId,
    },
  });

  await prisma.activityLog.create({
    data: {
      agencyId,
      userId: session.user.id,
      action: "TEAM_MEMBER_ADDED",
      entityType: "User",
      entityId: user.id,
      metadata: { name, email, role },
    },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
}
