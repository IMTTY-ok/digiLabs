import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FlaskConical,
  LockKeyhole,
  MapPin,
  Wrench,
} from "lucide-react";

import { LabCard } from "@/components/labs/lab-card";
import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, EmptyState, Panel, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { EXPERIMENTS, EXPERIMENT_BY_ID } from "@/lib/data/experiments";
import { LABORATORIES } from "@/lib/data/labs";
import {
  getActiveSessionForStudent,
  getEquipmentForLabs,
  getLabAccess,
  getProgressForStudent,
} from "@/lib/data/repository";
import type { LabId } from "@/types";

export const metadata: Metadata = {
  title: "Laboratories",
  description: "Browse the laboratories your institution has provisioned and open any experiment assigned to you.",
};

export default async function LabsPage() {
  const user = await requireUser();
  const isStudent = user.role === "student" && Boolean(user.studentId);
  const access: LabId[] = isStudent && user.studentId ? getLabAccess(user.studentId) : LABORATORIES.map((lab) => lab.id);
  const progress = isStudent && user.studentId ? getProgressForStudent(user.studentId) : [];
  const progressByExperiment = Object.fromEntries(progress.map((entry) => [entry.experimentId, entry]));
  const equipment = getEquipmentForLabs(access);
  const attention = equipment.filter((item) =>
    ["inspection-due", "warning", "unavailable"].includes(item.status),
  );
  const activeSession = isStudent && user.studentId ? getActiveSessionForStudent(user.studentId) : null;

  const totalExperiments = EXPERIMENTS.filter(
    (experiment) => experiment.published && access.includes(experiment.labId),
  ).length;

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="cobalt" dot>
              Laboratories
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {access.length} of {LABORATORIES.length} blocks
            </span>
          </>
        }
        title="Choose a laboratory."
        description="Access is controlled per block by your institution. Published experiments and equipment readiness are shown for each laboratory."
        meta={
          <>
            <MetaItem
              label="Open labs"
              value={<span className="font-mono">{access.length}</span>}
            />
            <MetaItem label="Experiments" value={totalExperiments} />
            <MetaItem label="Equipment attention" value={attention.length} />
            <MetaItem
              label="Session"
              value={activeSession ? "Open" : "None"}
            />
          </>
        }
        actions={
          <>
            <Link href="/campus" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
              Campus map
            </Link>
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {activeSession ? (
          <div className="mb-6 rounded-sm border border-cyan/25 bg-cyan-wash px-4 py-3 text-sm text-cyan">
            <p className="font-medium">
              A simulated session is open in {LABORATORIES.find((lab) => lab.id === activeSession.labId)?.shortName}.
            </p>
            <p className="mt-0.5 text-[0.8125rem]">
              Return to that laboratory to end it, or open another experiment in the same block.
            </p>
          </div>
        ) : null}

        {access.length === 0 ? (
          <EmptyState
            icon={<FlaskConical className="size-6" strokeWidth={1.6} />}
            title="No laboratory access yet"
            description="Your account is active, but no laboratory has been granted. Ask the institution administrator to grant access."
            action={
              <Link href="/dashboard" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                Back to dashboard
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {LABORATORIES.map((lab) => {
                const labExperiments = EXPERIMENTS.filter(
                  (experiment) => experiment.published && experiment.labId === lab.id,
                );
                const labAttention = equipment.filter(
                  (item) =>
                    item.labId === lab.id &&
                    ["inspection-due", "warning", "unavailable"].includes(item.status),
                ).length;
                return (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    compact
                    experimentCount={labExperiments.length}
                    equipmentAttention={labAttention}
                    accessible={access.includes(lab.id)}
                    href={`/labs/${lab.id}`}
                  />
                );
              })}
            </div>

            <section aria-labelledby="labs-all-experiments" className="mt-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="labs-all-experiments" className="text-lg font-semibold tracking-[-0.01em] text-ink">
                    Published experiments
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Click an experiment to open its workspace.
                  </p>
                </div>
              </div>
              <Panel className="overflow-hidden">
                {LABORATORIES.flatMap((lab) =>
                  access.includes(lab.id)
                    ? EXPERIMENTS.filter((experiment) => experiment.published && experiment.labId === lab.id)
                    : [],
                ).length ? (
                  <div>
                    {LABORATORIES.flatMap((lab) =>
                      access.includes(lab.id)
                        ? EXPERIMENTS.filter((experiment) => experiment.published && experiment.labId === lab.id)
                        : [],
                    ).map((experiment) => (
                      <Link
                        key={experiment.id}
                        href={`/labs/${experiment.labId}/${experiment.id}`}
                        className="group flex flex-col gap-4 border-b border-line px-4 py-4 transition-colors duration-150 last:border-b-0 hover:bg-surface-raised sm:flex-row sm:items-center sm:gap-5 sm:px-5"
                      >
                        <span
                          className={`hidden h-10 w-1 shrink-0 rounded-full sm:block ${access.includes(experiment.labId) ? "bg-cobalt" : "bg-line"}`}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                              {experiment.code}
                            </span>
                            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                              · {LABORATORIES.find((lab) => lab.id === experiment.labId)?.shortName}
                            </span>
                            <Badge tone="neutral">{experiment.difficulty}</Badge>
                          </div>
                          <h3 className="mt-1.5 text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-ink">
                            {experiment.shortTitle}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                            <Wrench className="size-3.5" strokeWidth={1.8} aria-hidden />
                            {experiment.durationMinutes} min
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-4 sm:w-56">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <Badge tone="cobalt">Open</Badge>
                              {isStudent && progressByExperiment[experiment.id] ? (
                                <span className="font-mono text-[0.5625rem] tabular text-ink-faint">
                                  {progressByExperiment[experiment.id].completedSteps.length}/5
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <ArrowRight
                            className="size-4 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
                            aria-hidden
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No published experiments"
                    description="No experiments are published for the laboratories you can access."
                  />
                )}
              </Panel>
            </section>
          </>
        )}
      </div>
    </>
  );
}
