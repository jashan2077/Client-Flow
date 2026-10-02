import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ActivityLogPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, role: true } },
      agency: { select: { name: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Activity Log</h1>
        <p className="text-gray-700 text-sm mt-1">Last 100 events across all agencies</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-600">No activity recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Time", "User", "Role", "Agency", "Action", "Entity", "Entity ID"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.user.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{log.user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.agency?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600">{log.entityType}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {log.entityId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
