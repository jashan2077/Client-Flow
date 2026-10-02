import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { agencyId: string } }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: params.agencyId },
  });

  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  // Log support session
  await prisma.supportSession.create({
    data: {
      superAdminId: session.user.id,
      agencyId: params.agencyId,
    },
  });

  await prisma.activityLog.create({
    data: {
      agencyId: params.agencyId,
      userId: session.user.id,
      action: "ENTERED_SUPPORT_MODE",
      entityType: "Agency",
      entityId: params.agencyId,
      metadata: { agencyName: agency.name },
    },
  });

  return NextResponse.json({
    success: true,
    agencyId: params.agencyId,
    agencyName: agency.name,
  });
}
