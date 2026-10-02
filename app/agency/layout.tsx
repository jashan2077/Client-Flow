import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgencyNav } from "@/components/agency/AgencyNav";
import { SupportModeBanner } from "@/components/agency/SupportModeBanner";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const { role, agencyId, supportAgencyId } = session.user;

  // Allow super admin in support mode
  if (role === "SUPER_ADMIN" && !supportAgencyId) {
    redirect("/super-admin/dashboard");
  }

  if (role !== "SUPER_ADMIN" && role !== "AGENCY_ADMIN" && role !== "AGENCY_TEAM") {
    redirect("/login");
  }

  const effectiveAgencyId = role === "SUPER_ADMIN" ? supportAgencyId! : agencyId!;

  const agency = await prisma.agency.findUnique({
    where: { id: effectiveAgencyId },
    select: { id: true, name: true, status: true },
  });

  if (!agency) redirect("/login");

  // Block suspended agencies for non-super-admin
  if (agency.status === "SUSPENDED" && role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-700">Account Suspended</h1>
          <p className="text-gray-600 mt-2">
            Your agency account has been suspended. Please contact ClientFlow support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AgencyNav agencyName={agency.name} />
      <div className="ml-64 flex-1 flex flex-col overflow-hidden">
        {role === "SUPER_ADMIN" && supportAgencyId && (
          <SupportModeBanner agencyName={agency.name} agencyId={agency.id} />
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
