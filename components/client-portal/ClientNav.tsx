"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/client-portal/dashboard", label: "Dashboard" },
  { href: "/client-portal/feedback", label: "Feedback" },
];

export function ClientNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-r border-gray-200 h-screen w-64 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600">ClientFlow</span>
        <p className="text-xs text-gray-600 mt-0.5">Client Portal</p>
      </div>
      <div className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="px-4 py-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
