import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ClientNav } from "@/components/client-portal/ClientNav";

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50">
      <ClientNav />
      <main className="ml-64 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
