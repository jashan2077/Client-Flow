import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { CreateClientForm } from "@/components/agency/CreateClientForm";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const clients = await prisma.client.findMany({
    where: { agencyId },
    include: {
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-700 text-sm mt-1">{clients.length} client(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client table */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Company", "Contact", "Email", "Projects", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-700 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.companyName}</td>
                      <td className="px-4 py-3 text-gray-600">{c.primaryContact}</td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{c._count.projects}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/agency/clients/${c.id}`}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                        No clients yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Create client */}
        <div>
          <Card>
            <CardHeader><CardTitle>Add Client</CardTitle></CardHeader>
            <CardContent>
              <CreateClientForm agencyId={agencyId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
