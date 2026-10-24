import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FlaskConical,
  LockKeyhole,
  MapPin,
  Sparkles,
  Wrench,
} from "lucide-react";

import { CampusExplorer } from "@/components/campus/campus-explorer";
import { accentTheme } from "@/components/labs/lab-accent";
import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, ButtonLink, EmptyState, Panel, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { EXPERIMENTS } from "@/lib/data/experiments";
import { CAMPUS_DESTINATIONS, LABORATORIES } from "@/lib/data/labs";
import {
  getActiveSessionForStudent,
  getEquipmentForLabs,
  getLabAccess,
  getLabActivity,
} from "@/lib/data/repository";
import { cn, formatDate } from "@/lib/utils/cn";
import type { LabId } from "@/types";

export const metadata: Metadata = {
  title: "Campus",
  description: "Navigate the Northline campus in three dimensions and enter any laboratory you have been granted.",
};

export default async function CampusPage() {
  const user = await requireUser();
  const isStudent = user.role === "student" && Boolean(user.studentId);
  const access: LabId[] = isStudent && user.studentId
    ? getLabAccess(user.studentId)
    : LABORATORIES.map((lab) => lab.id);

  const activeSession = isStudent && user.studentId ? getActiveSessionForStudent(user.studentId) : null;
  const activeSessionLabId = activeSession?.labId ?? null;

  const experimentCounts = Object.fromEntries(
    LABORATORIES.map((lab) => [
      lab.id,
      EXPERIMENTS.filter((experiment) => experiment.published && experiment.labId === lab.id).length,
    ]),
  ) as Record<LabId, number>;

  const equipment = getEquipmentForLabs(access);
  const attention = equipment.filter((item) =>
    ["inspection-due", "warning", "unavailable"].includes(item.status),
  );
  const activity = getLabActivity(access, 6);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="cyan" dot>
              Campus navigator
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              Blocks A–C · {access.length} of {LABORATORIES.length} open
            </span>
          </>
        }
        title="Walk the campus. Pick your bench."
        description="Orbit the plaza, inspect each block's provision and enter any laboratory your institution has granted. Readings produced inside are browser simulations, not hardware."
        meta={
          <>
            <MetaItem
              label="Laboratories open"
              value={<span className="font-mono">{access.length}</span>}
            />
            <MetaItem label="Experiments" value={EXPERIMENTS.filter((experiment) => experiment.published).length} />
            <MetaItem label="Equipment attention" value={attention.length} />
            <MetaItem
              label="Session"
              value={activeSession ? `${activeSession.outcome === "active" ? "Open" : "Closed"}` : "None"}
            />
          </>
        }
        actions={
          <>
            <ButtonLink href="/labs" variant="secondary">
              <FlaskConical className="size-4" aria-hidden />
              Laboratories
            </ButtonLink>
            {isStudent ? (
              <ButtonLink href="/dashboard">
                Dashboard
                <Compass className="size-4" aria-hidden />
              </ButtonLink>
            ) : null}
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <CampusExplorer
          access={access}
          role={user.role}
          activeSessionLabId={activeSessionLabId}
          experimentCounts={experimentCounts}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <section aria-labelledby="campus-blocks">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="campus-blocks" className="text-lg font-semibold tracking-[-0.01em] text-ink">
                  Block directory
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Provision, access and readiness for each laboratory block.
                </p>
              </div>
              <Link href="/labs" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                Open a laboratory
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {LABORATORIES.map((lab) => {
                const theme = accentTheme(lab.accent);
                const labEquipment = equipment.filter((item) => item.labId === lab.id);
                const labAttention = labEquipment.filter((item) =>
                  ["inspection-due", "warning", "unavailable"].includes(item.status),
                ).length;
                const accessible = isStudent ? access.includes(lab.id) : true;
                return (
                  <article key={lab.id} className="panel hover-lift relative overflow-hidden p-5">
                    <div className={`absolute inset-x-0 top-0 h-[3px] ${theme.bg}`} aria-hidden />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                          {lab.code}
                        </p>
                        <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.015em] text-ink">
                          {lab.name}
                        </h3>
                        <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          {lab.room}
                        </p>
                      </div>
                      {accessible ? (
                        <Badge tone="ok" dot>
                          Open
                        </Badge>
                      ) : (
                        <Badge tone="neutral">
                          <LockKeyhole className="size-2.5" aria-hidden />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">{lab.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {lab.focus.map((item) => (
                        <Badge key={item} tone="neutral">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-xs">
                      <div>
                        <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Capacity
                        </dt>
                        <dd className="mt-0.5 font-medium text-ink">{lab.capacity} seats</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Equipment
                        </dt>
                        <dd
                          className={`mt-0.5 font-medium ${labAttention > 0 ? "text-amber" : "text-ok"}`}
                        >
                          {labAttention > 0
                            ? `${labAttention} need attention`
                            : "All ready"}
                        </dd>
                      </div>
                    </dl>
                    {accessible ? (
                      <Link
                        href={`/labs/${lab.id}`}
                        className={cn(
                          "mt-4 inline-flex w-full items-center justify-between gap-2 rounded-sm border px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors duration-150",
                          theme.borderSoft,
                          theme.bgSoft,
                          theme.textDeep,
                          "hover:border-current",
                        )}
                      >
                        Enter laboratory
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <p className="mt-4 rounded-sm border border-line bg-surface-raised px-3.5 py-2.5 text-xs leading-relaxed text-ink-faint">
                        Access is granted by your institution.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="label-mono">Readiness</p>
                    <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                      Equipment needing attention
                    </h3>
                  </div>
                  <Wrench className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />
                </div>
              </div>
              {attention.length ? (
                <ul className="divide-y divide-line">
                  {attention.slice(0, 6).map((item) => (
                    <li key={item.id} className="px-5 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.8125rem] font-medium leading-snug text-ink">
                            {item.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                            {LABORATORIES.find((lab) => lab.id === item.labId)?.shortName} ·{" "}
                            {item.status.replace("-", " ")}
                          </p>
                        </div>
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-amber" strokeWidth={1.8} aria-hidden />
                      </div>
                      {item.note ? (
                        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{item.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="All clear"
                  description="No equipment is flagged in your laboratories."
                  className="py-8"
                />
              )}
            </Panel>

            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <p className="label-mono">Recent activity</p>
                <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">In your blocks</h3>
              </div>
              {activity.length ? (
                <ol className="divide-y divide-line">
                  {activity.map((event) => (
                    <li key={event.id} className="px-5 py-3.5">
                      <p className="text-[0.8125rem] font-medium text-ink">{event.message}</p>
                      <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                        {LABORATORIES.find((lab) => lab.id === event.labId)?.shortName} ·{" "}
                        {new Date(event.at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No activity yet" description="Start a session to create a record." className="py-8" />
              )}
            </Panel>

            <Panel className="p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface-raised text-cyan">
                  <Sparkles className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">How the model is labelled</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    Numbers and states shown are simulations. Institutional records are marked{" "}
                    <Badge tone="neutral">Record</Badge>. The 3D view is a navigational aid, not a
                    survey-grade model.
                  </p>
                  <p className="mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    Seeded {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
