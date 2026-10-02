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

  const clients = await prisma.client.findMany({
    where: { agencyId },
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const body = await req.json();
  const { companyName, primaryContact, email, phone, notes } = body;

  if (!companyName || !primaryContact || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { agencyId, companyName, primaryContact, email, phone, notes },
  });

  await prisma.activityLog.create({
    data: {
      agencyId,
      userId: session.user.id,
      action: "CLIENT_CREATED",
      entityType: "Client",
      entityId: client.id,
      metadata: { companyName },
    },
  });

  return NextResponse.json({ client }, { status: 201 });
}
