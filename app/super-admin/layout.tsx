import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuperAdminNav } from "@/components/super-admin/SuperAdminNav";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminNav />
      <main className="ml-64 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
