"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Props {
  projects: { id: string; name: string }[];
  clientId: string;
}

export function SubmitFeedbackForm({ projects, clientId }: Props) {
  const [projectId, setProjectId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/client/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, content }),
    });

    if (res.ok) {
      setSuccess(true);
      setProjectId("");
      setContent("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">Feedback submitted!</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          <option value="">Select project…</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
          placeholder="Describe your feedback or change request…"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>
      <Button type="submit" disabled={loading || projects.length === 0} className="w-full">
        {loading ? "Submitting…" : "Submit Feedback"}
      </Button>
      {projects.length === 0 && (
        <p className="text-xs text-gray-600 text-center">No active projects to submit feedback for.</p>
      )}
    </form>
  );
}
