import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "@/components/agency/CreateProjectForm";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: { clientId?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const [clients, teamMembers] = await Promise.all([
    prisma.client.findMany({
      where: { agencyId },
      select: { id: true, companyName: true },
    }),
    prisma.user.findMany({
      where: { agencyId, role: { in: ["AGENCY_ADMIN", "AGENCY_TEAM"] } },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
        <p className="text-gray-700 text-sm mt-1">Create a new project for a client</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateProjectForm
          clients={clients}
          teamMembers={teamMembers}
          defaultClientId={searchParams.clientId}
        />
      </div>
    </div>
  );
}
