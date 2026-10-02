"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED"] as const;

export function UpdateFeedbackStatus({
  feedbackId,
  currentStatus,
}: {
  feedbackId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function update(newStatus: string) {
    setLoading(true);
    await fetch(`/api/agency/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {STATUSES.filter((s) => s !== status).map((s) => (
        <button
          key={s}
          onClick={() => update(s)}
          disabled={loading}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          Mark as {s}
        </button>
      ))}
    </div>
  );
}
