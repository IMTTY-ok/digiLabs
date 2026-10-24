import type { Metadata } from "next";

import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, Panel, PanelHeader, Stat } from "@/components/ui";
import { StudentDirectory } from "@/features/institution/student-directory";
import { requireStaff } from "@/lib/auth/session";
import { getAssignments, getAllProgress, getAllQuizResults, getLabAccess, getObservationCount, getStudents } from "@/lib/data/repository";
import type { AccountStatus, LabId } from "@/types";

export const metadata: Metadata = { title: "Students" };

export default async function InstitutionStudentsPage() {
  const user = await requireStaff(["admin", "instructor"]);
  const canManage = user.role === "admin";

  const students = getStudents();
  const progress = getAllProgress();
  const quizResults = getAllQuizResults();

  const items = students.map((student) => {
    const studentProgress = progress.filter((entry) => entry.studentId === student.id);
    const studentQuizzes = quizResults.filter((result) => result.studentId === student.id);
    const bestResult = studentQuizzes.reduce<(typeof studentQuizzes)[number] | null>(
      (current, result) =>
        current === null || result.score / result.total > current.score / current.total ? result : current,
      null,
    );
    const assigned = getAssignments(student.id).length;
    const completed = studentProgress.filter((entry) => entry.status === "completed").length;
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      rollNo: student.rollNo,
      stream: student.stream,
      status: student.status as AccountStatus,
      createdAt: student.createdAt,
      labs: getLabAccess(student.id) as LabId[],
      assigned,
      completed,
      bestScore: bestResult ? `${bestResult.score}/${bestResult.total}` : null,
      observations: getObservationCount(student.id),
    };
  });

  const pendingCount = students.filter((student) => student.status === "pending").length;
  const activeCount = students.filter((student) => student.status === "active").length;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="navy" dot>
              Students
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {students.length} enrolled
            </span>
          </>
        }
        title="Student directory."
        description={
          canManage
            ? "Approve new accounts, grant laboratory access and manage account status."
            : "Review student progress and laboratory access. Status and access changes require an administrator."
        }
        meta={
          <>
            <MetaItem label="Total" value={students.length} />
            <MetaItem label="Active" value={activeCount} />
            <MetaItem label="Pending" value={pendingCount} />
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <Stat label="Active students" value={activeCount} hint="Can sign in" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Pending approval" value={pendingCount} hint="Awaiting review" />
          </Panel>
          <Panel className="p-5">
            <Stat
              label="Laboratory access"
              value={items.reduce((sum, item) => sum + item.labs.length, 0)}
              hint="Granted blocks"
            />
          </Panel>
        </div>

        <StudentDirectory students={items} canManage={canManage} />
      </div>
    </>
  );
}
