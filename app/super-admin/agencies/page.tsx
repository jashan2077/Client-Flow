import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { AgencyStatus } from "@prisma/client";

async function getAgencies(search: string, status: string) {
  return prisma.agency.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(status && status !== "ALL" ? { status: status as AgencyStatus } : {}),
    },
    include: {
      _count: { select: { users: true, clients: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusVariants: Record<string, "success" | "danger" | "secondary"> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  INACTIVE: "secondary",
};

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const status = searchParams.status || "ALL";
  const agencies = await getAgencies(search, status);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agencies</h1>
          <p className="text-sm text-gray-700 mt-1">{agencies.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <form className="flex gap-3 flex-wrap">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search agencies…"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="status"
            defaultValue={status}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Name", "Owner", "Email", "Status", "Plan", "Users", "Clients", "Projects", "Created", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agencies.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.ownerName}</td>
                <td className="px-4 py-3 text-gray-600">{a.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariants[a.status]}>{a.status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.plan}</td>
                <td className="px-4 py-3 text-gray-600">{a._count.users}</td>
                <td className="px-4 py-3 text-gray-600">{a._count.clients}</td>
                <td className="px-4 py-3 text-gray-600">{a._count.projects}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/super-admin/agencies/${a.id}`}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {agencies.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-600">
                  No agencies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
