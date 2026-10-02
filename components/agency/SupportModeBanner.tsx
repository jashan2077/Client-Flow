"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SupportModeBanner({
  agencyName,
  agencyId,
}: {
  agencyName: string;
  agencyId: string;
}) {
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

  async function handleExit() {
    setExiting(true);
    await fetch(`/api/support/exit`, { method: "POST" });
    router.push(`/super-admin/agencies/${agencyId}`);
  }

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        🔍 You are viewing <strong>{agencyName}</strong> as Super Admin (Support
        Mode). All actions are logged.
      </span>
      <Button
        variant="outline"
        size="sm"
        className="border-yellow-700 text-yellow-900 hover:bg-yellow-300"
        onClick={handleExit}
        disabled={exiting}
      >
        {exiting ? "Exiting…" : "Exit Support Mode"}
      </Button>
    </div>
  );
}
