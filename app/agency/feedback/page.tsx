import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UpdateFeedbackStatus } from "@/components/agency/UpdateFeedbackStatus";

const feedbackStatusColors: Record<string, "danger" | "warning" | "success"> = {
  OPEN: "danger",
  IN_REVIEW: "warning",
  RESOLVED: "success",
};

export default async function FeedbackPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const feedbacks = await prisma.feedback.findMany({
    where: { project: { agencyId } },
    include: {
      project: { select: { name: true } },
      client: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Feedback</h1>
        <p className="text-gray-700 text-sm mt-1">
          {feedbacks.filter((f) => f.status === "OPEN").length} open items
        </p>
      </div>

      <div className="space-y-3">
        {feedbacks.length === 0 ? (
          <p className="text-gray-600 py-8 text-center">No feedback submitted yet.</p>
        ) : (
          feedbacks.map((f) => (
            <Card key={f.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{f.client.companyName}</span>
                    <span className="text-gray-600 text-sm ml-2">on {f.project.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feedbackStatusColors[f.status]}>{f.status}</Badge>
                    <span className="text-xs text-gray-600">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{f.content}</p>
                <div className="mt-3">
                  <UpdateFeedbackStatus feedbackId={f.id} currentStatus={f.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
