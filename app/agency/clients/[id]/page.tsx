import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

const statusColors: Record<string, "success" | "warning" | "secondary" | "danger"> = {
  ACTIVE: "success",
  ON_HOLD: "warning",
  COMPLETED: "secondary",
  CANCELLED: "danger",
};

export default async function ClientDetailPage({
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

  const client = await prisma.client.findFirst({
    where: { id: params.id, agencyId },
    include: {
      projects: {
        include: {
          tasks: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const recentActivity = await prisma.activityLog.findMany({
    where: {
      agencyId,
      entityType: "Client",
      entityId: params.id,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
        <p className="text-gray-700 text-sm mt-1">
          {client.primaryContact} · {client.email}
          {client.phone && ` · ${client.phone}`}
        </p>
        {client.notes && (
          <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-4 py-2 rounded-md">
            {client.notes}
          </p>
        )}
      </div>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projects ({client.projects.length})</CardTitle>
          <Link
            href={`/agency/projects/new?clientId=${client.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            + New Project
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {client.projects.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-700">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {client.projects.map((p) => {
                const total = p.tasks.length;
                const done = p.tasks.filter((t) => t.status === "DONE").length;
                return (
                  <li key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <Link href={`/agency/projects/${p.id}`} className="font-medium hover:text-blue-600">
                        {p.name}
                      </Link>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {done}/{total} tasks done
                      </p>
                    </div>
                    <Badge variant={statusColors[p.status]}>{p.status}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-700">No activity.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((log) => (
                <li key={log.id} className="px-6 py-3 flex justify-between text-sm">
                  <span>
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-gray-700 ml-2">{log.action}</span>
                  </span>
                  <span className="text-gray-600 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
