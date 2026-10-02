import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();

  const feedback = await prisma.feedback.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ feedback });
}
