import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supportAgencyId = session.user.supportAgencyId;

  if (supportAgencyId) {
    // Close the open support session
    await prisma.supportSession.updateMany({
      where: {
        superAdminId: session.user.id,
        agencyId: supportAgencyId,
        endedAt: null,
      },
      data: { endedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        agencyId: supportAgencyId,
        userId: session.user.id,
        action: "EXITED_SUPPORT_MODE",
        entityType: "Agency",
        entityId: supportAgencyId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
