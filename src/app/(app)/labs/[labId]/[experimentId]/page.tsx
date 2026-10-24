import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperimentWorkspace } from "@/features/experiments/experiment-workspace";
import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { EXPERIMENT_BY_ID } from "@/lib/data/experiments";
import { LAB_BY_ID, LABORATORIES } from "@/lib/data/labs";
import {
  canAccessLab,
  getActiveSessionForStudent,
  getObservationRecords,
  getProgress,
  getQuizResults,
} from "@/lib/data/repository";
import { toPublicContent } from "@/features/experiments/registry";
import type { ExperimentId, LabId } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labId: string; experimentId: string }>;
}): Promise<Metadata> {
  const { experimentId } = await params;
  const experiment = EXPERIMENT_BY_ID[experimentId as ExperimentId];
  return { title: experiment ? experiment.shortTitle : "Experiment" };
}

export default async function ExperimentPage({
  params,
  searchParams,
}: {
  params: Promise<{ labId: string; experimentId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { labId, experimentId } = await params;
  const { step } = await searchParams;

  const lab = LAB_BY_ID[labId as LabId];
  const experiment = EXPERIMENT_BY_ID[experimentId as ExperimentId];
  if (!lab || !experiment || experiment.labId !== lab.id) notFound();
  if (!experiment.published) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <PageHeader title="Experiment not available" description="This experiment is not published yet." />
      </div>
    );
  }

  const user = await requireUser();
  const isStudent = user.role === "student" && Boolean(user.studentId);

  if (isStudent && user.studentId) {
    if (!canAccessLab(user.studentId, lab.id)) {
      return (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <PageHeader
            title="Access not granted"
            description="Your institution has not granted access to this laboratory."
            actions={
              <Link href={`/labs/${lab.id}`} className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                Back to laboratory
              </Link>
            }
          />
        </div>
      );
    }
  }

  const readOnly = !isStudent;
  const studentId = isStudent ? user.studentId : null;

  const content = toPublicContent(experiment.id);
  const progress = studentId ? getProgress(studentId, experiment.id) : null;
  const observations = studentId ? getObservationRecords(studentId, experiment.id) : [];
  const quizResults = studentId ? getQuizResults(studentId, experiment.id) : [];
  const latestQuiz = quizResults.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0] ?? null;
  const activeSession = studentId ? getActiveSessionForStudent(studentId) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <PageHeader
        eyebrow={
          <>
            <Badge tone={lab.accent === "cyan" ? "cyan" : lab.accent === "amber" ? "amber" : "cobalt"} dot>
              {experiment.code}
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {lab.shortName} · {experiment.durationMinutes} min · {experiment.difficulty}
            </span>
          </>
        }
        title={experiment.title}
        description={experiment.aim}
        meta={
          <>
            <MetaItem label="Experiment" value={experiment.code} />
            <MetaItem label="Laboratory" value={lab.shortName} />
            <MetaItem label="Status" value={progress?.status ?? "Staff preview"} />
          </>
        }
        actions={
          <>
            <Link href={`/labs/${lab.id}`} className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
              Laboratory
            </Link>
            <Link href="/campus" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
              Campus
            </Link>
          </>
        }
      />

      <ExperimentWorkspace
        lab={lab}
        experiment={experiment}
        content={content}
        initialProgress={progress}
        initialObservations={observations}
        bestQuizScore={progress?.bestQuizScore ?? latestQuiz?.score ?? null}
        quizAttempts={progress?.quizAttempts ?? quizResults.length}
        latestQuizResult={latestQuiz}
        activeSession={activeSession}
        initialStep={step}
        readOnly={readOnly}
      />
    </div>
  );
}
