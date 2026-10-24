import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FlaskConical,
  MapPin,
} from "lucide-react";

import { ExperimentRow } from "@/components/labs/experiment-row";
import { accentTheme } from "@/components/labs/lab-accent";
import { MetaItem, PageHeader } from "@/components/layout/page-header";
import {
  Alert,
  Badge,
  EmptyState,
  Panel,
  PanelHeader,
  Stat,
} from "@/components/ui";
import { SessionControl } from "@/features/labs/session-control";
import { requireUser } from "@/lib/auth/session";
import { EXPERIMENTS } from "@/lib/data/experiments";
import { LAB_BY_ID, LABORATORIES } from "@/lib/data/labs";
import {
  getActiveSessionForStudent,
  getLabAccess,
  getLabActivity,
  getProgressForStudent,
} from "@/lib/data/repository";
import { formatDate, relativeTime } from "@/lib/utils/cn";
import type { LabId } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labId: string }>;
}): Promise<Metadata> {
  const { labId } = await params;
  const lab = LAB_BY_ID[labId as LabId];
  return { title: lab ? lab.name : "Laboratory" };
}

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const lab = LAB_BY_ID[labId as LabId];
  if (!lab) notFound();

  const user = await requireUser();
  const isStudent = user.role === "student" && Boolean(user.studentId);
  const access = isStudent && user.studentId ? getLabAccess(user.studentId) : LABORATORIES.map((item) => item.id);
  const accessGranted = !isStudent || access.includes(lab.id);

  const experiments = EXPERIMENTS.filter((experiment) => experiment.labId === lab.id);
  const publishedExperiments = experiments.filter((experiment) => experiment.published);
  const activity = getLabActivity([lab.id], 18);

  const theme = accentTheme(lab.accent);

  const studentId = isStudent ? user.studentId : null;
  const progress = studentId ? getProgressForStudent(studentId) : [];
  const progressByExperiment = Object.fromEntries(progress.map((entry) => [entry.experimentId, entry]));
  const activeSession = studentId ? getActiveSessionForStudent(studentId) : null;
  const activeForThisLab =
    activeSession && activeSession.labId === lab.id ? activeSession : null;
  const otherActiveSession =
    activeSession && activeSession.labId !== lab.id ? activeSession : null;
  const otherLabName = otherActiveSession
    ? LABORATORIES.find((item) => item.id === otherActiveSession.labId)?.shortName
    : undefined;

  // access already reflected in accessGranted

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone={lab.accent === "cyan" ? "cyan" : lab.accent === "amber" ? "amber" : "cobalt"} dot>
              {lab.code}
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {lab.room}
            </span>
          </>
        }
        title={lab.name}
        description={lab.description}
        meta={
          <>
            <MetaItem label="Capacity" value={`${lab.capacity} seats`} />
            <MetaItem label="Experiments" value={publishedExperiments.length} />
            <MetaItem
              label="Access"
              value={accessGranted ? "Granted" : "Locked"}
            />
          </>
        }
        actions={
          <>
            <Link href="/labs" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
              <ArrowLeft className="mr-1 inline size-3.5" aria-hidden />
              Laboratories
            </Link>
            <Link href="/campus" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
              Campus
            </Link>
            {!isStudent ? (
              <Link
                href={`/api/export/students?labId=${lab.id}`}
                className="text-xs font-medium text-cobalt hover:text-cobalt-deep"
              >
                Download CSV
              </Link>
            ) : null}
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {!accessGranted ? (
          <Alert tone="warning" title="Access not granted" className="mb-6">
            Your institution has not granted access to this laboratory. Contact the registrar or your
            instructor to request entry.
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-6">
            {/* Session control (students only) */}
            {isStudent && accessGranted ? (
              <Panel className="overflow-hidden">
                <div className="border-b border-line px-5 py-4">
                  <PanelHeader
                    eyebrow="Session"
                    title="Simulated session"
                    description="Start a session to log equipment use, then end it with a power-off acknowledgement."
                    action={<FlaskConical className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />}
                  />
                </div>
                <div className="p-5">
                  <SessionControl
                    labId={lab.id}
                    experiments={publishedExperiments.map((experiment) => ({
                      id: experiment.id,
                      code: experiment.code,
                      shortTitle: experiment.shortTitle,
                    }))}
                    activeSession={activeForThisLab}
                    otherActiveSession={otherActiveSession}
                    canStart={accessGranted}
                    otherLabName={otherLabName}
                  />
                </div>
              </Panel>
            ) : null}

            {/* Experiments */}
            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <PanelHeader
                  eyebrow={`${publishedExperiments.length} published`}
                  title="Experiments"
                  description="Open an experiment to work through its sections, simulation and assessment."
                  action={<ClipboardList className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />}
                />
              </div>
              {publishedExperiments.length ? (
                <div>
                  {publishedExperiments.map((experiment) => (
                    <ExperimentRow
                      key={experiment.id}
                      experiment={experiment}
                      progress={progressByExperiment[experiment.id] ?? null}
                      href={`/labs/${lab.id}/${experiment.id}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No published experiments"
                  description="This laboratory has no experiments available yet."
                  className="py-10"
                />
              )}
            </Panel>

            {/* Activity */}
            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <PanelHeader
                  eyebrow={`${activity.length} events`}
                  title="Laboratory activity"
                  description="Safety events recorded in this block."
                />
              </div>
              {activity.length ? (
                <ol className="divide-y divide-line">
                  {activity.map((event) => (
                    <li key={event.id} className="flex gap-3 px-5 py-3.5">
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          event.kind === "safety" ? "bg-amber" : "bg-cobalt"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-[0.8125rem] font-medium text-ink">{event.message}</p>
                        <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                          {event.kind.replace("-", " ")} · {relativeTime(event.at)}
                          {event.actorName ? ` · ${event.actorName}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No activity yet" description="Start a session to create a record." className="py-8" />
              )}
            </Panel>
          </div>

          {/* Aside */}
          <aside className="min-w-0 space-y-6">
            <Panel className="overflow-hidden">
              <div className={`border-b border-line px-5 py-4 ${theme.bgSoft}`}>
                <p className="label-mono">Block details</p>
                <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                  {lab.shortName}
                </h3>
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-ink-soft">{lab.description}</p>
                <div>
                  <p className="label-mono mb-2">Focus areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.focus.map((item) => (
                      <Badge key={item} tone="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Code
                    </dt>
                    <dd className="font-mono font-medium text-ink">{lab.code}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Room
                    </dt>
                    <dd className="text-right font-medium text-ink">{lab.room}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                      Capacity
                    </dt>
                    <dd className="font-medium text-ink">{lab.capacity}</dd>
                  </div>
                </dl>
              </div>
            </Panel>

            <Panel className="p-5">
              <p className="label-mono mb-2">Safety reminder</p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Simulated sessions do not energise hardware. Physical work must be supervised, and every
                session ends with a power-off acknowledgement.
              </p>
              <Link
                href="/campus"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 text-xs font-medium text-cobalt hover:text-cobalt-deep"
              >
                <MapPin className="size-3.5" aria-hidden />
                Back to campus
              </Link>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
