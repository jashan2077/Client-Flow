import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";
import { ProjectStatus, Priority } from "@prisma/client";

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

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const { status, priority } = searchParams;

  const projects = await prisma.project.findMany({
    where: {
      agencyId,
      ...(status && status !== "ALL" ? { status: status as ProjectStatus } : {}),
      ...(priority && priority !== "ALL" ? { priority: priority as Priority } : {}),
    },
    include: {
      client: { select: { companyName: true } },
      tasks: { select: { status: true } },
      projectManager: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-700 text-sm mt-1">{projects.length} project(s)</p>
        </div>
        <Link
          href="/agency/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          + New Project
        </Link>
      </div>

      {/* Filters */}
      <form className="flex gap-3 flex-wrap mb-6">
        <select
          name="status"
          defaultValue={status || "ALL"}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          name="priority"
          defaultValue={priority || "ALL"}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Filter
        </button>
      </form>

      {/* Project grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-600">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const total = p.tasks.length;
            const done = p.tasks.filter((t) => t.status === "DONE").length;
            const progress = total > 0 ? (done / total) * 100 : 0;
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/agency/projects/${p.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-gray-600 mt-0.5 truncate">
                        {p.client.companyName}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2 shrink-0">
                      <Badge variant={priorityColors[p.priority]}>{p.priority}</Badge>
                      <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-700 mb-3 line-clamp-2">{p.description}</p>
                  )}
                  <ProgressBar value={progress} />
                  <div className="flex justify-between mt-3 text-xs text-gray-600">
                    <span>{done}/{total} tasks</span>
                    {p.endDate && (
                      <span>Due: {new Date(p.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
