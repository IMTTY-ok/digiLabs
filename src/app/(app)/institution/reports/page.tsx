import type { Metadata } from "next";
import Link from "next/link";

import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, EmptyState, Panel, PanelHeader, Stat } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { EXPERIMENTS, EXPERIMENT_BY_ID } from "@/lib/data/experiments";
import { LABORATORIES } from "@/lib/data/labs";
import {
  getAllProgress,
  getAllQuizResults,
  getDb,
  getStudents,
} from "@/lib/data/repository";
import { formatDate } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Student reports" };

export default async function InstitutionReportsPage() {
  await requireStaff(["admin", "instructor"]);

  const students = getStudents();
  const assignments = getDb().assignments;
  const progress = getAllProgress();
  const quizResults = getAllQuizResults();

  const progressByKey = new Map(progress.map((entry) => [`${entry.studentId}::${entry.experimentId}`, entry]));
  const bestQuizByKey = new Map<string, (typeof quizResults)[number]>();
  for (const result of quizResults) {
    const key = `${result.studentId}::${result.experimentId}`;
    const current = bestQuizByKey.get(key);
    if (!current || result.score / result.total > current.score / current.total) {
      bestQuizByKey.set(key, result);
    }
  }

  const rows = assignments
    .map((assignment) => {
      const student = students.find((item) => item.id === assignment.studentId);
      const experiment = EXPERIMENT_BY_ID[assignment.experimentId];
      const progressEntry = progressByKey.get(`${assignment.studentId}::${assignment.experimentId}`);
      const quiz = bestQuizByKey.get(`${assignment.studentId}::${assignment.experimentId}`);
      return {
        id: assignment.id,
        student,
        experiment,
        assignedAt: assignment.assignedAt,
        status: progressEntry?.status ?? "not-started",
        completedSteps: progressEntry?.completedSteps.length ?? 0,
        quiz,
      };
    })
    .sort((a, b) => (a.student?.name ?? "").localeCompare(b.student?.name ?? ""));

  const completedAssignments = rows.filter((row) => row.status === "completed").length;
  const attemptedAssessments = rows.filter((row) => row.quiz).length;
  const avgScore =
    attemptedAssessments > 0
      ? Math.round(
          (rows.reduce((sum, row) => {
            if (!row.quiz) return sum;
            return sum + row.quiz.score / row.quiz.total;
          }, 0) /
            attemptedAssessments) *
            100,
        )
      : 0;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="navy" dot>
              Reports
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {rows.length} assignments · {students.length} students
            </span>
          </>
        }
        title="Student reports."
        description="Assigned experiments, progress and best assessment scores for each student."
        meta={
          <>
            <MetaItem label="Assignments" value={rows.length} />
            <MetaItem label="Completed" value={completedAssignments} />
            <MetaItem label="Avg score" value={`${avgScore}%`} />
          </>
        }
        actions={
          <Link href="/institution/results" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
            Results matrix
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Panel className="p-5">
            <Stat label="Students" value={students.length} hint="Enrolled" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Assignments" value={rows.length} hint="Issued" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Completed" value={completedAssignments} hint="Finished" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Avg score" value={`${avgScore}%`} hint="Best attempts" />
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <PanelHeader
              eyebrow={`${rows.length} rows`}
              title="Assignment reports"
              description="Progress sections and best assessment score per assigned experiment."
            />
          </div>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised text-left">
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Student
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Experiment
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Laboratory
                    </th>
                    <th className="px-5 py-3 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Progress
                    </th>
                    <th className="px-5 py-3 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Best score
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Assigned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-b-0">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{row.student?.name ?? row.id}</p>
                        <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                          {row.student?.rollNo ?? ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {row.experiment?.shortTitle ?? row.id}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {row.experiment
                          ? LABORATORIES.find((lab) => lab.id === row.experiment?.labId)?.shortName
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`font-mono text-[0.625rem] tabular ${
                            row.status === "completed"
                              ? "text-ok"
                              : row.completedSteps > 0
                                ? "text-cobalt"
                                : "text-ink-faint"
                          }`}
                        >
                          {row.completedSteps}/5
                        </span>
                        <Badge
                          tone={
                            row.status === "completed"
                              ? "ok"
                              : row.completedSteps > 0
                                ? "cobalt"
                                : "neutral"
                          }
                        >
                          {row.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {row.quiz ? (
                          <Badge tone={row.quiz.score / row.quiz.total >= 0.6 ? "ok" : "amber"}>
                            {row.quiz.score}/{row.quiz.total}
                          </Badge>
                        ) : (
                          <span className="font-mono text-[0.5625rem] text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                        {formatDate(row.assignedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No assignments yet"
              description="Assigned experiments will appear here once the institution issues them."
              className="py-10"
            />
          )}
        </Panel>
      </div>
    </>
  );
}