import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AgencyActions } from "@/components/super-admin/AgencyActions";

const statusVariants: Record<string, "success" | "danger" | "secondary"> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  INACTIVE: "secondary",
};

export default async function AgencyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const agency = await prisma.agency.findUnique({
    where: { id: params.id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      clients: { select: { id: true, companyName: true, primaryContact: true } },
      projects: { select: { id: true, name: true, status: true, createdAt: true } },
      _count: { select: { users: true, clients: true, projects: true } },
    },
  });

  if (!agency) notFound();

  const recentActivity = await prisma.activityLog.findMany({
    where: { agencyId: agency.id },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
          <p className="text-gray-700 text-sm mt-1">
            {agency.email} · {agency.phone || "No phone"} · Plan:{" "}
            <span className="font-medium">{agency.plan}</span>
          </p>
        </div>
        <Badge variant={statusVariants[agency.status]}>{agency.status}</Badge>
      </div>

      <AgencyActions agencyId={agency.id} currentStatus={agency.status} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Team Members", value: agency._count.users },
          { label: "Clients", value: agency._count.clients },
          { label: "Projects", value: agency._count.projects },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <p className="text-sm text-gray-700">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team */}
      <Card>
        <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Role", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-gray-700 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agency.users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant="info">{u.role}</Badge></td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-700">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((log) => (
                <li key={log.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-gray-700 ml-2">{log.action}</span>
                    <span className="text-gray-600 ml-2">({log.entityType}: {log.entityId})</span>
                  </div>
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
