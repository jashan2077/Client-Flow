import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { AddTeamMemberForm } from "@/components/agency/AddTeamMemberForm";

const roleVariants: Record<string, "info" | "secondary"> = {
  AGENCY_ADMIN: "info",
  AGENCY_TEAM: "secondary",
};

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const members = await prisma.user.findMany({
    where: {
      agencyId,
      role: { in: ["AGENCY_ADMIN", "AGENCY_TEAM"] },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-700 text-sm mt-1">{members.length} member(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team list */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Name", "Email", "Role", "Joined"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-700 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-gray-600">{m.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariants[m.role] || "secondary"}>{m.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Add member form */}
        {session.user.role === "AGENCY_ADMIN" || session.user.role === "SUPER_ADMIN" ? (
          <div>
            <Card>
              <CardHeader><CardTitle>Invite Team Member</CardTitle></CardHeader>
              <CardContent>
                <AddTeamMemberForm agencyId={agencyId} />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
