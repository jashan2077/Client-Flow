"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/super-admin/dashboard", label: "Dashboard" },
  { href: "/super-admin/agencies", label: "Agencies" },
  { href: "/super-admin/activity", label: "Activity Log" },
];

export function SuperAdminNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-gray-900 text-white h-screen w-64 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold text-blue-400">ClientFlow</span>
        <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
          Super Admin
        </span>
      </div>
      <div className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="px-4 py-4 border-t border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-600 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
