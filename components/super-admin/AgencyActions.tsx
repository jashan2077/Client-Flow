"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function AgencyActions({
  agencyId,
  currentStatus,
}: {
  agencyId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleStatus() {
    setLoading(true);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await fetch(`/api/super-admin/agencies/${agencyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  async function enterSupport() {
    setLoading(true);
    const res = await fetch(`/api/support/enter/${agencyId}`);
    if (res.ok) {
      router.push("/agency/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-3">
      <Button onClick={enterSupport} disabled={loading} variant="primary" size="sm">
        Enter Workspace (Support Mode)
      </Button>
      <Button
        onClick={toggleStatus}
        disabled={loading}
        variant={currentStatus === "ACTIVE" ? "danger" : "secondary"}
        size="sm"
      >
        {currentStatus === "ACTIVE" ? "Suspend Agency" : "Activate Agency"}
      </Button>
    </div>
  );
}
