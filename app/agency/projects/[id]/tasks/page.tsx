import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { KanbanBoard } from "@/components/agency/KanbanBoard";

export default async function TasksPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const project = await prisma.project.findFirst({
    where: { id: params.id, agencyId },
    include: {
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) notFound();

  const teamMembers = await prisma.user.findMany({
    where: { agencyId, role: { in: ["AGENCY_ADMIN", "AGENCY_TEAM"] } },
    select: { id: true, name: true },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href={`/agency/projects/${params.id}`} className="text-sm text-gray-600 hover:text-gray-600">
            ← {project.name}
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Task Board</h1>
        </div>
      </div>
      <KanbanBoard
        projectId={project.id}
        tasks={project.tasks as any}
        teamMembers={teamMembers}
      />
    </div>
  );
}
