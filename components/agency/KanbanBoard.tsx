"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
};

const COLUMNS = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DONE", label: "Done" },
] as const;

const priorityColors: Record<string, "danger" | "warning" | "secondary"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "secondary",
};

interface Props {
  projectId: string;
  tasks: Task[];
  teamMembers: { id: string; name: string }[];
}

export function KanbanBoard({ projectId, tasks: initialTasks, teamMembers }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch(`/api/agency/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks([...tasks, data.task]);
      setNewTask({ title: "", description: "", assigneeId: "", priority: "MEDIUM", dueDate: "" });
      setShowForm(false);
    }
    setCreating(false);
  }

  async function updateStatus(taskId: string, status: string) {
    await fetch(`/api/agency/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  const now = new Date();

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="sm">
          {showForm ? "Cancel" : "+ Add Task"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={createTask} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <h3 className="font-medium text-gray-900">New Task</h3>
          <input
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-3 gap-3">
            <select
              value={newTask.assigneeId}
              onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" disabled={creating} size="sm">
            {creating ? "Creating…" : "Create Task"}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {colTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < now &&
                    task.status !== "DONE";
                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-md border border-gray-200 p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-gray-900 flex-1">{task.title}</p>
                        <Badge variant={priorityColors[task.priority]}>{task.priority.charAt(0)}</Badge>
                      </div>
                      {task.assignee && (
                        <p className="text-xs text-gray-600 mt-1">→ {task.assignee.name}</p>
                      )}
                      {task.dueDate && (
                        <p className={`text-xs mt-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-600"}`}>
                          {isOverdue ? "⚠ " : ""}Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                          <button
                            key={c.key}
                            onClick={() => updateStatus(task.id, c.key)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
