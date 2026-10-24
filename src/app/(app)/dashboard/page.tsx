import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Compass,
  FlaskConical,
  Clock3,
  MapPin,
} from "lucide-react";

import { ExperimentRow } from "@/components/labs/experiment-row";
import { LabCard } from "@/components/labs/lab-card";
import { accentTheme } from "@/components/labs/lab-accent";
import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { CampusPlan } from "@/components/marketing/campus-plan";
import {
  Alert,
  Badge,
  buttonClass,
  ButtonLink,
  EmptyState,
  ExperimentStatusBadge,
  Panel,
  PanelHeader,
  ProgressBar,
  SourceBadge,
  Stat,
} from "@/components/ui";
import { PROGRESS_STEPS } from "@/features/experiments/steps";
import { requireStudent } from "@/lib/auth/session";
import { EXPERIMENTS, EXPERIMENT_BY_ID } from "@/lib/data/experiments";
import { LABORATORIES, LAB_BY_ID } from "@/lib/data/labs";
import {
  getInstitution,
  getLabAccess,
  getProgressForStudent,
  getQuizResults,
  getSafetyEvents,
  getSessions,
  getStudentByUserId,
} from "@/lib/data/repository";
import { formatDate, relativeTime } from "@/lib/utils/cn";
import type { LabId } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireStudent();
  const student = getStudentByUserId(user.id);
  if (!student) {
    return (
      <PageHeader
        eyebrow={<Badge tone="danger">Account</Badge>}
        title="Student record missing"
        description="This demo account has no linked student profile. Contact the institution administrator."
      />
    );
  }

  const institution = getInstitution(user.institutionId);
  const labIds = getLabAccess(student.id) as LabId[];
  const accessibleLabs = LABORATORIES.filter((lab) => labIds.includes(lab.id));
  const accessibleExperiments = EXPERIMENTS.filter(
    (experiment) => experiment.published && labIds.includes(experiment.labId),
  );
  const progress = getProgressForStudent(student.id);
  const progressByExperiment = Object.fromEntries(
    progress.map((entry) => [entry.experimentId, entry]),
  );
  const quizResults = getQuizResults(student.id);
  const sessions = getSessions(student.id, 6);
  const safety = getSafetyEvents(labIds, 6);

  const completed = accessibleExperiments.filter(
    (experiment) => progressByExperiment[experiment.id]?.status === "completed",
  ).length;
  const inProgress = accessibleExperiments.filter(
    (experiment) => progressByExperiment[experiment.id]?.status === "in-progress",
  );
  const bestQuiz = quizResults.reduce(
    (best, result) => (best === null || result.score / result.total > best.score / best.total ? result : best),
    null as (typeof quizResults)[number] | null,
  );
  const activeSession = sessions.find((session) => session.outcome === "active") ?? null;

  const continueExperiment =
    inProgress.sort((a, b) => {
      const at = progressByExperiment[a.id]?.updatedAt ?? "";
      const bt = progressByExperiment[b.id]?.updatedAt ?? "";
      return bt.localeCompare(at);
    })[0] ??
    accessibleExperiments.find((experiment) => !progressByExperiment[experiment.id]) ??
    accessibleExperiments[0];

  const continueProgress = continueExperiment ? progressByExperiment[continueExperiment.id] : null;
  const continueLab = continueExperiment ? LAB_BY_ID[continueExperiment.labId] : null;
  const continueTheme = continueLab ? accentTheme(continueLab.accent) : accentTheme("cobalt");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = student.name.split(" ")[0];

  const activity = [
    ...sessions.map((session) => ({
      id: session.id,
      at: session.startedAt,
      kind: "session" as const,
      title:
        session.outcome === "active"
          ? "Session in progress"
          : session.outcome === "completed"
            ? "Session completed"
            : "Session ended early",
      detail: `${LAB_BY_ID[session.labId].shortName}${session.experimentId ? ` · ${EXPERIMENT_BY_ID[session.experimentId].shortTitle}` : ""}`,
    })),
    ...quizResults.map((result) => ({
      id: result.id,
      at: result.submittedAt,
      kind: "quiz" as const,
      title: `Assessment · ${result.score}/${result.total}`,
      detail: EXPERIMENT_BY_ID[result.experimentId].shortTitle,
    })),
    ...safety.map((event) => ({
      id: event.id,
      at: event.at,
      kind: "safety" as const,
      title: event.severity === "info" ? "Safety record" : `Safety · ${event.severity}`,
      detail: event.message,
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="cobalt" dot>
              Student workspace
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {institution?.shortName} · {institution?.academicYear}
            </span>
          </>
        }
        title={`${greeting}, ${firstName}.`}
        description="Your laboratories, experiments and recorded work in one place. Access is granted per laboratory by the institution."
        meta={
          <>
            <MetaItem label="Roll no" value={<span className="font-mono">{student.rollNo}</span>} />
            <MetaItem label="Course" value={`${student.course} · ${student.stream}`} />
            <MetaItem label="Year" value={student.academicYear} />
          </>
        }
        actions={
          <>
            <ButtonLink href="/campus" variant="secondary">
              <Compass className="size-4" aria-hidden />
              Open campus
            </ButtonLink>
            <ButtonLink href="/labs">
              Laboratories
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {activeSession ? (
          <Alert
            tone="info"
            className="mb-6"
            title="A simulated session is open"
            action={
              <Link
                href={`/labs/${activeSession.labId}`}
                className={buttonClass("secondary", "sm")}
              >
                Return to lab
              </Link>
            }
          >
            Started {relativeTime(activeSession.startedAt)} in {LAB_BY_ID[activeSession.labId].shortName}.
            End the session from the laboratory page when you are finished.
          </Alert>
        ) : null}

        {accessibleLabs.length === 0 ? (
          <Alert tone="warning" title="No laboratory access yet" className="mb-6">
            Your account is active, but no laboratory has been granted. Ask the institution administrator to
            grant access to the laboratories you need.
          </Alert>
        ) : null}

        {/* Stats */}
        <dl className="panel grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {[
            { label: "Laboratories open", value: labIds.length, hint: `of ${LABORATORIES.length} blocks` },
            {
              label: "Experiments assigned",
              value: accessibleExperiments.length,
              hint: `${inProgress.length} in progress`,
            },
            {
              label: "Completed",
              value: completed,
              hint: accessibleExperiments.length ? `${Math.round((completed / accessibleExperiments.length) * 100)}% of assigned` : "No assignments",
            },
            {
              label: "Best assessment",
              value: bestQuiz ? `${bestQuiz.score}/${bestQuiz.total}` : "—",
              hint: bestQuiz ? EXPERIMENT_BY_ID[bestQuiz.experimentId].shortTitle : "No attempt yet",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`p-5 sm:p-6 ${index < 2 ? "border-b border-line sm:border-b-0" : ""} ${index % 2 === 0 ? "border-r border-line sm:border-r-0" : ""}`}
            >
              <Stat label={item.label} value={item.value} hint={item.hint} />
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-6">
            {/* Continue */}
            {continueExperiment && continueLab ? (
              <Panel className="overflow-hidden">
                <div className="grid lg:grid-cols-[1fr_13rem]">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-[0.5625rem] uppercase tracking-[0.14em] ${continueTheme.textDeep}`}>
                        {continueLab.shortName} · {continueExperiment.code}
                      </span>
                      <Badge tone="neutral">{continueExperiment.difficulty}</Badge>
                      <ExperimentStatusBadge status={continueProgress?.status ?? "not-started"} />
                    </div>
                    <h2 className="mt-3 max-w-xl text-xl font-semibold leading-snug tracking-[-0.02em] text-ink">
                      {continueExperiment.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{continueExperiment.aim}</p>

                    <div className="mt-5 flex items-center gap-3">
                      <ProgressBar
                        value={((continueProgress?.completedSteps.length ?? 0) / 5) * 100}
                        tone={continueTheme.bar}
                        label="Experiment progress"
                        className="max-w-xs flex-1"
                      />
                      <span className="font-mono text-[0.625rem] tabular text-ink-soft">
                        {continueProgress?.completedSteps.length ?? 0}/5 sections
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <ButtonLink href={`/labs/${continueLab.id}/${continueExperiment.id}`}>
                        {continueProgress && continueProgress.completedSteps.length > 0 ? "Continue experiment" : "Start experiment"}
                        <ArrowRight className="size-4" aria-hidden />
                      </ButtonLink>
                      <ButtonLink href={`/labs/${continueLab.id}`} variant="ghost">
                        Lab overview
                      </ButtonLink>
                    </div>
                  </div>

                  <div className="hidden flex-col justify-between border-l border-line bg-surface-raised p-5 lg:flex">
                    <div>
                      <p className="label-mono">Sections</p>
                      <ul className="mt-3 space-y-2.5">
                        {PROGRESS_STEPS.map((step) => {
                          const done = continueProgress?.completedSteps.includes(step.id);
                          return (
                            <li key={step.id} className="flex items-center gap-2 text-xs">
                              <span
                                className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full border font-mono text-[0.5rem] ${
                                  done
                                    ? "border-ok bg-ok text-white"
                                    : "border-line-strong bg-surface text-ink-faint"
                                }`}
                                aria-hidden
                              >
                                {done ? "✓" : ""}
                              </span>
                              <span className={done ? "text-ink" : "text-ink-soft"}>{step.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="mt-5 border-t border-line pt-3">
                      <p className="flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                        <Clock3 className="size-3" aria-hidden />
                        {continueExperiment.durationMinutes} min
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>
            ) : (
              <Panel>
                <EmptyState
                  icon={<FlaskConical className="size-6" strokeWidth={1.6} />}
                  title={accessibleExperiments.length ? "All assigned experiments are complete" : "No experiments assigned"}
                  description={
                    accessibleExperiments.length
                      ? "Review a completed experiment or explore the campus while you wait for the next assignment."
                      : "Once your institution grants a laboratory, its experiments will appear here."
                  }
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <ButtonLink href="/campus" variant="secondary" size="sm">
                        Explore campus
                      </ButtonLink>
                      <ButtonLink href="/labs" size="sm">
                        Browse labs
                      </ButtonLink>
                    </div>
                  }
                />
              </Panel>
            )}

            {/* Laboratories */}
            <section aria-labelledby="dashboard-labs">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="dashboard-labs" className="text-lg font-semibold tracking-[-0.01em] text-ink">
                    Your laboratories
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">Access is controlled per block by the institution.</p>
                </div>
                <Link href="/labs" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                  View all
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {LABORATORIES.map((lab) => {
                  const labExperiments = EXPERIMENTS.filter(
                    (experiment) => experiment.published && experiment.labId === lab.id,
                  );

                  return (
                    <LabCard
                      key={lab.id}
                      lab={lab}
                      compact
                      experimentCount={labExperiments.length}
                      accessible={labIds.includes(lab.id)}
                      href={`/labs/${lab.id}`}
                    />
                  );
                })}
              </div>
            </section>

            {/* Assigned experiments */}
            <section aria-labelledby="dashboard-experiments">
              <Panel className="overflow-hidden">
                <div className="border-b border-line px-5 py-4">
                  <PanelHeader
                    eyebrow={`${accessibleExperiments.length} assigned`}
                    title={<span id="dashboard-experiments">Assigned experiments</span>}
                    description="Progress is saved against your student record."
                  />
                </div>
                {accessibleExperiments.length ? (
                  <div>
                    {accessibleExperiments.map((experiment) => (
                      <ExperimentRow
                        key={experiment.id}
                        experiment={experiment}
                        progress={progressByExperiment[experiment.id]}
                        showLab
                        href={`/labs/${experiment.labId}/${experiment.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Nothing assigned yet"
                    description="Granted laboratories will list their published experiments here."
                  />
                )}
              </Panel>
            </section>
          </div>

          {/* Aside */}
          <aside className="min-w-0 space-y-6">
            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <PanelHeader
                  eyebrow="Audit"
                  title="Recent activity"
                  action={<Activity className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />}
                />
              </div>
              {activity.length ? (
                <ol className="divide-y divide-line">
                  {activity.map((item) => (
                    <li key={item.id} className="flex gap-3 px-5 py-3.5">
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          item.kind === "quiz" ? "bg-cobalt" : item.kind === "safety" ? "bg-amber" : "bg-ok"
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-[0.8125rem] font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{item.detail}</p>
                        <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                          {relativeTime(item.at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No activity yet" description="Start an experiment to create a record." className="py-8" />
              )}
            </Panel>

            <Panel className="p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface-raised text-cyan">
                  <MapPin className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">How readings are labelled</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Numbers produced by the browser simulation are marked <SourceBadge source="simulation" />.
                    Institutional records are marked <SourceBadge source="record" />.
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-[0.6875rem] text-ink-faint">
                    <Clock3 className="size-3" aria-hidden />
                    Seeded {formatDate(institution?.academicYear ? new Date().toISOString() : null)}
                  </p>
                </div>
              </div>
            </Panel>
          </aside>
        </div>

        {/* Campus CTA */}
        <section className="mt-8 overflow-hidden rounded-lg border border-line bg-navy text-paper">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_18rem] lg:items-center">
            <div>
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/50">
                Campus · Blocks A–C
              </p>
              <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-[-0.025em]">
                Step onto the campus and pick your bench.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                Orbit the plaza, check a block&apos;s provision and enter any laboratory you have been granted.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/campus" variant="inverse">
                  <Compass className="size-4" aria-hidden />
                  Explore campus
                </ButtonLink>
                {continueLab ? (
                  <Link href={`/labs/${continueLab.id}`} className={buttonClass("outline-inverse")}>
                    Open {continueLab.shortName}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-white/10">
              <CampusPlan activeId={activeSession?.labId ?? null} idPrefix="dashboard" className="block h-auto w-full" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
