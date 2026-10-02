"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { name: string } | null;
};

type Meeting = {
  id: string;
  title: string;
  notes: string | null;
  date: Date | string;
};

type Feedback = {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  client: { companyName: string };
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  uploadedBy: { name: string };
};

const taskStatusColors: Record<string, "secondary" | "info" | "warning" | "success"> = {
  TODO: "secondary",
  IN_PROGRESS: "info",
  IN_REVIEW: "warning",
  DONE: "success",
};

const priorityColors: Record<string, "danger" | "warning" | "secondary"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "secondary",
};

const feedbackStatusColors: Record<string, "danger" | "warning" | "success"> = {
  OPEN: "danger",
  IN_REVIEW: "warning",
  RESOLVED: "success",
};

interface Props {
  projectId: string;
  tasks: Task[];
  meetings: Meeting[];
  feedbacks: Feedback[];
  files: FileItem[];
  teamMembers: { id: string; name: string }[];
}

const TABS = ["Tasks", "Meetings", "Feedback", "Files"] as const;
type Tab = (typeof TABS)[number];

export function ProjectTabs({ projectId, tasks, meetings, feedbacks, files }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Tasks");

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-700 hover:text-gray-700"
            }`}
          >
            {tab}
            {tab === "Tasks" && ` (${tasks.length})`}
            {tab === "Feedback" && ` (${feedbacks.filter((f) => f.status === "OPEN").length})`}
          </button>
        ))}
      </div>

      {activeTab === "Tasks" && (
        <div className="space-y-2">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-700">{tasks.length} tasks</span>
            <a
              href={`/agency/projects/${projectId}/tasks`}
              className="text-sm text-blue-600 hover:underline"
            >
              Open Task Board →
            </a>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No tasks yet.</p>
          ) : (
            tasks.map((t) => {
              const isOverdue =
                t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE";
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div>
                    <span className="font-medium text-sm text-gray-900">{t.title}</span>
                    {t.assignee && (
                      <span className="text-xs text-gray-600 ml-2">→ {t.assignee.name}</span>
                    )}
                    {isOverdue && (
                      <Badge variant="danger" className="ml-2">Overdue</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={priorityColors[t.priority]}>{t.priority}</Badge>
                    <Badge variant={taskStatusColors[t.status]}>{t.status}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "Meetings" && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No meetings recorded.</p>
          ) : (
            meetings.map((m) => (
              <Card key={m.id}>
                <CardContent className="py-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm text-gray-900">{m.title}</p>
                    <span className="text-xs text-gray-600">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  {m.notes && <p className="text-sm text-gray-600 mt-1">{m.notes}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "Feedback" && (
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No feedback submitted.</p>
          ) : (
            feedbacks.map((f) => (
              <Card key={f.id}>
                <CardContent className="py-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-600">{f.client.companyName}</span>
                    <Badge variant={feedbackStatusColors[f.status]}>{f.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-700">{f.content}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(f.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "Files" && (
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-gray-600 py-4 text-center">No files attached.</p>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div>
                  <span className="font-medium text-sm text-gray-900">{f.name}</span>
                  <span className="text-xs text-gray-600 ml-2">by {f.uploadedBy.name}</span>
                </div>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
