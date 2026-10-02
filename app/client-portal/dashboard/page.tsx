import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

const statusColors: Record<string, "success" | "warning" | "secondary" | "danger"> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
};

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const clientId = session.user.clientId!;

  const [projects, openFeedback] = await Promise.all([
    prisma.project.findMany({
      where: { clientId },
      include: {
        tasks: { select: { status: true } },
        milestones: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedback.findMany({
      where: { clientId, status: "OPEN" },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-700 text-sm mt-1">{projects.length} project(s)</p>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {projects.length === 0 ? (
          <p className="text-gray-600 col-span-2 py-8 text-center">No projects yet.</p>
        ) : (
          projects.map((p) => {
            const total = p.tasks.length;
            const done = p.tasks.filter((t) => t.status === "DONE").length;
            const progress = total > 0 ? (done / total) * 100 : 0;
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/client-portal/projects/${p.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {p.name}
                    </Link>
                    <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                  </div>
                  <ProgressBar value={progress} />
                  <p className="text-xs text-gray-600 mt-2">{done}/{total} tasks complete</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Open feedback */}
      {openFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Feedback Items ({openFeedback.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {openFeedback.map((f) => (
                <li key={f.id} className="px-6 py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-700">{f.project.name}: </span>
                    <span className="text-gray-700">{f.content.slice(0, 80)}{f.content.length > 80 ? "…" : ""}</span>
                  </div>
                  <Badge variant="danger">OPEN</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
