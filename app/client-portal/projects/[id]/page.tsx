import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const milestoneColors: Record<string, "success" | "info" | "secondary"> = {
  COMPLETED: "success",
  IN_PROGRESS: "info",
  PENDING: "secondary",
};

export default async function ClientProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const clientId = session.user.clientId!;

  const project = await prisma.project.findFirst({
    where: { id: params.id, clientId },
    include: {
      tasks: { select: { status: true, title: true } },
      milestones: { orderBy: { order: "asc" } },
      meetings: { orderBy: { date: "desc" } },
      files: {
        where: { taskId: null },
        include: { uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  const total = project.tasks.length;
  const done = project.tasks.filter((t) => t.status === "DONE").length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600 mt-1">{project.description}</p>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-700">{done}/{total} tasks</span>
          </div>
          <ProgressBar value={progress} color="green" />
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {project.milestones.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2 shrink-0">
                <div className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  m.status === "COMPLETED"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : m.status === "IN_PROGRESS"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700"
                }`}>
                  {m.title}
                </div>
                {i < project.milestones.length - 1 && <span className="text-gray-600">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meeting notes */}
      {project.meetings.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Meeting Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {project.meetings.map((m) => (
              <div key={m.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex justify-between">
                  <p className="font-medium text-sm text-gray-900">{m.title}</p>
                  <span className="text-xs text-gray-600">{new Date(m.date).toLocaleDateString()}</span>
                </div>
                {m.notes && <p className="text-sm text-gray-600 mt-1">{m.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Shared files */}
      {project.files.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Shared Files</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {project.files.map((f) => (
              <div key={f.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{f.name}</span>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
