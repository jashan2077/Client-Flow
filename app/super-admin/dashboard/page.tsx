import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

async function getStats() {
  const [
    totalAgencies,
    activeAgencies,
    suspendedAgencies,
    inactiveAgencies,
    totalUsers,
    totalClients,
    totalProjects,
    recentActivity,
  ] = await Promise.all([
    prisma.agency.count(),
    prisma.agency.count({ where: { status: "ACTIVE" } }),
    prisma.agency.count({ where: { status: "SUSPENDED" } }),
    prisma.agency.count({ where: { status: "INACTIVE" } }),
    prisma.user.count(),
    prisma.client.count(),
    prisma.project.count(),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, agency: { select: { name: true } } },
    }),
  ]);
  return { totalAgencies, activeAgencies, suspendedAgencies, inactiveAgencies, totalUsers, totalClients, totalProjects, recentActivity };
}

export default async function SuperAdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Agencies", value: stats.totalAgencies, color: "text-blue-600" },
    { label: "Active", value: stats.activeAgencies, color: "text-green-600" },
    { label: "Suspended", value: stats.suspendedAgencies, color: "text-red-600" },
    { label: "Inactive", value: stats.inactiveAgencies, color: "text-gray-700" },
    { label: "Total Users", value: stats.totalUsers, color: "text-blue-600" },
    { label: "Total Clients", value: stats.totalClients, color: "text-purple-600" },
    { label: "Total Projects", value: stats.totalProjects, color: "text-indigo-600" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-700 text-sm mt-1">ClientFlow Super Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <p className="text-sm text-gray-700">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentActivity.length === 0 ? (
            <p className="px-6 py-4 text-sm text-gray-700">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.recentActivity.map((log) => (
                <li key={log.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{log.user.name}</span>
                    <span className="text-gray-700 ml-2">{log.action}</span>
                    {log.agency && (
                      <Badge variant="info" className="ml-2">{log.agency.name}</Badge>
                    )}
                  </div>
                  <span className="text-gray-600 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
