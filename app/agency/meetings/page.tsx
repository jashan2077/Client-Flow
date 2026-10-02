import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AddMeetingForm } from "@/components/agency/AddMeetingForm";

export default async function MeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const agencyId =
    session.user.role === "SUPER_ADMIN"
      ? session.user.supportAgencyId!
      : session.user.agencyId!;

  const meetings = await prisma.meeting.findMany({
    where: { project: { agencyId } },
    include: { project: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const projects = await prisma.project.findMany({
    where: { agencyId, status: "ACTIVE" },
    select: { id: true, name: true },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-700 text-sm mt-1">{meetings.length} meeting(s)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {meetings.length === 0 ? (
            <p className="text-gray-600 py-8 text-center">No meetings recorded yet.</p>
          ) : (
            meetings.map((m) => (
              <Card key={m.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{m.title}</p>
                      <p className="text-xs text-blue-600 mt-0.5">{m.project.name}</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  </div>
                  {m.notes && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{m.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Record Meeting</CardTitle></CardHeader>
            <CardContent>
              <AddMeetingForm projects={projects} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
