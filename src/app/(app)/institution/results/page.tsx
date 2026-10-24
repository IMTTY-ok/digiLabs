import type { Metadata } from "next";
import Link from "next/link";

import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, EmptyState, Panel, PanelHeader, Stat } from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { EXPERIMENTS } from "@/lib/data/experiments";
import { LABORATORIES } from "@/lib/data/labs";
import {
  getAllProgress,
  getAllQuizResults,
  getObservationCount,
  getStudents,
} from "@/lib/data/repository";
import { formatDate } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Results" };

export default async function InstitutionResultsPage() {
  await requireStaff(["admin", "instructor"]);

  const students = getStudents();
  const progress = getAllProgress();
  const quizResults = getAllQuizResults();
  const publishedExperiments = EXPERIMENTS.filter((experiment) => experiment.published);

  const bestQuiz = new Map<string, (typeof quizResults)[number]>();
  for (const result of quizResults) {
    const key = `${result.studentId}::${result.experimentId}`;
    const current = bestQuiz.get(key);
    if (!current || result.score / result.total > current.score / current.total) {
      bestQuiz.set(key, result);
    }
  }

  const progressByStudentExperiment = new Map<string, (typeof progress)[number]>();
  for (const entry of progress) {
    progressByStudentExperiment.set(`${entry.studentId}::${entry.experimentId}`, entry);
  }

  const completedCells = publishedExperiments.length * students.length;
  const completedCount = publishedExperiments.reduce((sum, experiment) => {
    return (
      sum +
      students.filter((student) => {
        const entry = progressByStudentExperiment.get(`${student.id}::${experiment.id}`);
        return entry?.status === "completed";
      }).length
    );
  }, 0);
  const assessmentCount = quizResults.length;
  const avgScore =
    quizResults.length > 0
      ? Math.round(
          (quizResults.reduce((sum, result) => sum + result.score / result.total, 0) /
            quizResults.length) *
            100,
        )
      : 0;
  const totalObservations = students.reduce(
    (sum, student) => sum + getObservationCount(student.id),
    0,
  );

  const recentQuizzes = [...quizResults]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 12);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="navy" dot>
              Results
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {students.length} students · {publishedExperiments.length} experiments
            </span>
          </>
        }
        title="Results matrix."
        description="Progress, best assessment scores and recorded observations across the cohort."
        actions={
          <Link
            href="/api/export/students"
            className="text-xs font-medium text-cobalt hover:text-cobalt-deep"
          >
            Download CSV
          </Link>
        }
        meta={
          <>
            <MetaItem label="Completion" value={`${completedCount}/${completedCells || 1}`} />
            <MetaItem label="Assessments" value={assessmentCount} />
            <MetaItem label="Avg score" value={`${avgScore}%`} />
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Panel className="p-5">
            <Stat label="Students" value={students.length} hint="Enrolled" />
          </Panel>
          <Panel className="p-5">
            <Stat
              label="Completed cells"
              value={completedCount}
              hint={`of ${completedCells}`}
            />
          </Panel>
          <Panel className="p-5">
            <Stat label="Assessments taken" value={assessmentCount} hint="All attempts" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Observations" value={totalObservations} hint="Recorded" />
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <PanelHeader
              eyebrow="Cohort"
              title="Progress and best assessment score"
              description="Each cell shows progress (sections complete) and the best assessment score for that student and experiment."
            />
          </div>
          {students.length && publishedExperiments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised text-left">
                    <th className="sticky left-0 z-10 bg-surface-raised px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Student
                    </th>
                    {publishedExperiments.map((experiment) => (
                      <th
                        key={experiment.id}
                        className="px-3 py-3 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint"
                      >
                        {experiment.id.toUpperCase()}
                      </th>
                    ))}
                    <th className="px-5 py-3 text-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Done
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const doneCount = publishedExperiments.filter((experiment) => {
                      const entry = progressByStudentExperiment.get(`${student.id}::${experiment.id}`);
                      return entry?.status === "completed";
                    }).length;
                    return (
                      <tr key={student.id} className="border-b border-line last:border-b-0">
                        <td className="sticky left-0 z-10 bg-surface px-5 py-3.5">
                          <p className="font-medium text-ink">{student.name}</p>
                          <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                            {student.rollNo}
                          </p>
                        </td>
                        {publishedExperiments.map((experiment) => {
                          const entry = progressByStudentExperiment.get(`${student.id}::${experiment.id}`);
                          const quiz = bestQuiz.get(`${student.id}::${experiment.id}`);
                          const done = entry?.completedSteps.length ?? 0;
                          return (
                            <td key={experiment.id} className="px-3 py-3.5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`font-mono text-[0.625rem] tabular ${
                                    entry?.status === "completed"
                                      ? "text-ok"
                                      : done > 0
                                        ? "text-cobalt"
                                        : "text-ink-faint"
                                  }`}
                                >
                                  {done}/5
                                </span>
                                {quiz ? (
                                  <Badge tone={quiz.score / quiz.total >= 0.6 ? "ok" : "amber"}>
                                    {quiz.score}/{quiz.total}
                                  </Badge>
                                ) : (
                                  <span className="font-mono text-[0.5625rem] text-ink-faint">—</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-mono tabular text-ink">
                            {doneCount}/{publishedExperiments.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No data yet" description="Students and published experiments are required." className="py-10" />
          )}
        </Panel>

        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <PanelHeader
              eyebrow={`${recentQuizzes.length} recent`}
              title="Recent assessments"
              description="Latest submissions across the cohort."
            />
          </div>
          {recentQuizzes.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-raised text-left">
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Student
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Experiment
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Score
                    </th>
                    <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuizzes.map((result) => {
                    const student = students.find((item) => item.id === result.studentId);
                    const experiment = EXPERIMENTS.find((item) => item.id === result.experimentId);
                    return (
                      <tr key={result.id} className="border-b border-line last:border-b-0">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-ink">{student?.name ?? result.studentId}</p>
                          <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                            {student?.rollNo ?? ""}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-ink-soft">
                          {experiment?.shortTitle ?? result.experimentId}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={result.score / result.total >= 0.6 ? "ok" : "amber"}>
                            {result.score}/{result.total}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                          {formatDate(result.submittedAt, true)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No assessments yet" description="Submitted assessments will appear here." className="py-10" />
          )}
        </Panel>

        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <PanelHeader
              eyebrow="Legend"
              title="How to read the matrix"
            />
          </div>
          <div className="grid gap-3 p-5 text-xs text-ink-soft sm:grid-cols-3">
            <p>
              <span className="font-mono tabular text-ok">5/5</span> — section count complete.
            </p>
            <p>
              <Badge tone="ok">4/6</Badge> — best assessment score.
            </p>
            <p>
              <span className="font-mono text-ink-faint">—</span> — no assessment attempt yet.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
