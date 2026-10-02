import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["ACTIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const agency = await prisma.agency.update({
    where: { id: params.id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      agencyId: agency.id,
      userId: session.user.id,
      action: `AGENCY_STATUS_CHANGED_TO_${status}`,
      entityType: "Agency",
      entityId: agency.id,
      metadata: { previousStatus: agency.status, newStatus: status },
    },
  });

  return NextResponse.json({ agency });
}
