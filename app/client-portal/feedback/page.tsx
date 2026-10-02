import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SubmitFeedbackForm } from "@/components/client-portal/SubmitFeedbackForm";

const feedbackStatusColors: Record<string, "danger" | "warning" | "success"> = {
  OPEN: "danger",
  IN_REVIEW: "warning",
  RESOLVED: "success",
};

export default async function ClientFeedbackPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const clientId = session.user.clientId!;

  const [feedbacks, projects] = await Promise.all([
    prisma.feedback.findMany({
      where: { clientId },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { clientId, status: "ACTIVE" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback & Change Requests</h1>
        <p className="text-gray-700 text-sm mt-1">
          {feedbacks.filter((f) => f.status === "OPEN").length} open items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback list */}
        <div className="lg:col-span-2 space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No feedback submitted yet.</p>
          ) : (
            feedbacks.map((f) => (
              <Card key={f.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-blue-600 font-medium">{f.project.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={feedbackStatusColors[f.status]}>{f.status}</Badge>
                      <span className="text-xs text-gray-600">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{f.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Submit form */}
        <div>
          <Card>
            <CardHeader><CardTitle>Submit Feedback</CardTitle></CardHeader>
            <CardContent>
              <SubmitFeedbackForm projects={projects} clientId={clientId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
