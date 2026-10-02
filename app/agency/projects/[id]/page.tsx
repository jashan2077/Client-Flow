import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";
import { ProjectTabs } from "@/components/agency/ProjectTabs";

const statusColors: Record<string, "success" | "warning" | "secondary" | "danger"> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
};

const priorityColors: Record<string, "danger" | "warning" | "secondary"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "secondary",
};

const milestoneStatusColors: Record<string, "success" | "info" | "secondary"> = {
  COMPLETED: "success",
  IN_PROGRESS: "info",
  PENDING: "secondary",
};

export default async function ProjectDetailPage({
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
      client: { select: { id: true, companyName: true } },
      projectManager: { select: { name: true } },
      tasks: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      milestones: { orderBy: { order: "asc" } },
      meetings: { orderBy: { date: "desc" } },
      feedbacks: {
        include: { client: { select: { companyName: true } } },
        orderBy: { createdAt: "desc" },
      },
      files: {
        include: { uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/agency/projects" className="text-sm text-gray-600 hover:text-gray-600">
              Projects
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <p className="text-gray-700 text-sm">
            Client: <Link href={`/agency/clients/${project.client.id}`} className="text-blue-600 hover:underline">{project.client.companyName}</Link>
            {project.projectManager && (
              <span> · PM: {project.projectManager.name}</span>
            )}
            {project.endDate && (
              <span> · Due: {new Date(project.endDate).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={priorityColors[project.priority]}>{project.priority}</Badge>
          <Badge variant={statusColors[project.status]}>{project.status}</Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Project Progress</span>
            <span className="text-sm text-gray-700">{doneTasks}/{totalTasks} tasks completed</span>
          </div>
          <ProgressBar value={progress} color="green" />
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {project.milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                  m.status === "COMPLETED"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : m.status === "IN_PROGRESS"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}>
                  {m.title}
                  <Badge variant={milestoneStatusColors[m.status]} className="ml-2">{m.status}</Badge>
                </div>
                {i < project.milestones.length - 1 && (
                  <span className="text-gray-600">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <ProjectTabs
        projectId={project.id}
        tasks={project.tasks as any}
        meetings={project.meetings}
        feedbacks={project.feedbacks as any}
        files={project.files as any}
        teamMembers={[]}
      />
    </div>
  );
}
