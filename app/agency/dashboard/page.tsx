import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

async function getDashboardData(agencyId: string) {
  const [
    totalClients,
    activeProjects,
    completedProjects,
    pendingFeedback,
    projects,
  ] = await Promise.all([
    prisma.client.count({ where: { agencyId } }),
    prisma.project.count({ where: { agencyId, status: "ACTIVE" } }),
    prisma.project.count({ where: { agencyId, status: "COMPLETED" } }),
    prisma.feedback.count({
      where: { project: { agencyId }, status: "OPEN" },
    }),
    prisma.project.findMany({
      where: { agencyId },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { companyName: true } },
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: { select: { status: true } },
      },
    }),
  ]);

  const now = new Date();
  const dueSoon = await prisma.project.count({
    where: {
      agencyId,
      status: "ACTIVE",
      endDate: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return { totalClients, activeProjects, completedProjects, dueSoon, pendingFeedback, projects };
}

const statusColors: Record<string, "success" | "warning" | "secondary" | "danger"> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
};

export default async function AgencyDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const data = await getDashboardData(agencyId);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-700 text-sm mt-1">Welcome back</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Clients", value: data.totalClients, color: "text-blue-600" },
          { label: "Active Projects", value: data.activeProjects, color: "text-green-600" },
          { label: "Completed Projects", value: data.completedProjects, color: "text-gray-600" },
          { label: "Pending Feedback", value: data.pendingFeedback, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <p className="text-sm text-gray-700">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Link href="/agency/projects" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {data.projects.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-700">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.projects.map((p) => {
                const total = p.tasks.length;
                const done = p.tasks.filter((t) => t.status === "DONE").length;
                const progress = total > 0 ? (done / total) * 100 : 0;
                return (
                  <li key={p.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Link
                          href={`/agency/projects/${p.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {p.name}
                        </Link>
                        <span className="text-xs text-gray-600 ml-2">
                          {p.client.companyName}
                        </span>
                      </div>
                      <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                    </div>
                    <ProgressBar value={progress} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
