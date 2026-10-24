import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  FlaskConical,
  Users,
  Wrench,
} from "lucide-react";

import { MetaItem, PageHeader } from "@/components/layout/page-header";
import {
  Alert,
  Badge,
  EmptyState,
  Panel,
  PanelHeader,
  Stat,
} from "@/components/ui";
import { requireStaff } from "@/lib/auth/session";
import { EXPERIMENTS } from "@/lib/data/experiments";
import { LABORATORIES } from "@/lib/data/labs";
import {
  getAllSessionRecords,
  getInstitution,
  getInstitutionOverview,
  getPendingStudents,
  getStudentById,
} from "@/lib/data/repository";
import { formatDate, relativeTime } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Institution overview" };

export default async function InstitutionOverviewPage() {
  const user = await requireStaff(["admin", "instructor", "technician"]);
  const institution = getInstitution(user.institutionId);
  const overview = getInstitutionOverview();
  const pending = getPendingStudents();
  const sessions = getAllSessionRecords(8);

  const isAdmin = user.role === "admin";
  const isTechnician = user.role === "technician";

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="navy" dot>
              Institution
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {institution?.shortName} · {institution?.academicYear}
            </span>
          </>
        }
        title="Institution overview."
        description="Students, laboratory access and recorded activity for Northline Institute."
        meta={
          <>
            <MetaItem label="Students" value={overview.total} />
            <MetaItem label="Active" value={overview.active} />
            <MetaItem label="Pending" value={overview.pending} />
            <MetaItem label="Experiments" value={overview.publishedExperiments} />
          </>
        }
        actions={
          <>
            {isAdmin ? (
              <Link href="/institution/students" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                Manage students
              </Link>
            ) : null}
            {isAdmin ? (
              <Link href="/institution/results" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                Results
              </Link>
            ) : null}
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <dl className="panel grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
          {[
            { label: "Students", value: overview.total, hint: `${overview.active} active` },
            { label: "Pending approvals", value: overview.pending, hint: "Awaiting review" },
            { label: "Recorded sessions", value: overview.sessions, hint: "Simulated" },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`p-5 sm:p-6 ${index < 2 ? "border-b border-line sm:border-b-0" : ""} ${index % 2 === 0 ? "border-r border-line sm:border-r-0" : ""}`}
            >
              <Stat label={item.label} value={item.value} hint={item.hint} />
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-6">
            {pending.length > 0 ? (
              <Alert tone="warning" title={`${pending.length} student${pending.length === 1 ? "" : "s"} awaiting approval`}>
                Review and approve new accounts before they can sign in.
                {isAdmin ? (
                  <Link href="/institution/students" className="ml-2 text-xs font-medium text-cobalt hover:text-cobalt-deep">
                    Review
                  </Link>
                ) : null}
              </Alert>
            ) : null}

            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <PanelHeader
                  eyebrow="Provision"
                  title="Laboratories"
                  description="Capacity, experiments and readiness for each block."
                  action={<Building2 className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />}
                />
              </div>
              <div className="grid gap-0 sm:grid-cols-3">
                {LABORATORIES.map((lab) => {
                  const labExperiments = EXPERIMENTS.filter(
                    (experiment) => experiment.published && experiment.labId === lab.id,
                  ).length;
                  return (
                    <div key={lab.id} className="border-b border-line p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                      <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                        {lab.code}
                      </p>
                      <h3 className="mt-1.5 text-base font-semibold tracking-[-0.015em] text-ink">
                        {lab.shortName}
                      </h3>
                      <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                        {lab.room}
                      </p>
                      <dl className="mt-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-ink-soft">Experiments</dt>
                          <dd className="font-mono tabular text-ink">{labExperiments}</dd>
                        </div>
                      </dl>
                      <Link
                        href={`/labs/${lab.id}`}
                        className="mt-3 inline-flex text-xs font-medium text-cobalt hover:text-cobalt-deep"
                      >
                        Open laboratory
                      </Link>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <PanelHeader
                  eyebrow={`${sessions.length} recent`}
                  title="Recent sessions"
                  description="Simulated sessions recorded across all laboratories."
                  action={<ClipboardList className="size-4 text-ink-faint" strokeWidth={1.8} aria-hidden />}
                />
              </div>
              {sessions.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-raised text-left">
                        <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Student
                        </th>
                        <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Laboratory
                        </th>
                        <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Experiment
                        </th>
                        <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Outcome
                        </th>
                        <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                          Started
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => {
                        return (
                          <tr key={session.id} className="border-b border-line last:border-b-0">
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-ink">
                                {getStudentById(session.studentId)?.name ?? session.studentId}
                              </p>
                              <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                                {getStudentById(session.studentId)?.rollNo ?? ""}
                              </p>
                            </td>
                            <td className="px-5 py-3.5 text-ink-soft">
                              {LABORATORIES.find((lab) => lab.id === session.labId)?.shortName}
                            </td>
                            <td className="px-5 py-3.5 text-ink-soft">
                              {session.experimentId
                                ? EXPERIMENTS.find((exp) => exp.id === session.experimentId)?.shortTitle
                                : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge
                                tone={
                                  session.outcome === "completed"
                                    ? "ok"
                                    : session.outcome === "ended-early"
                                      ? "amber"
                                      : "cobalt"
                                }
                                dot
                              >
                                {session.outcome.replace("-", " ")}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                              {relativeTime(session.startedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No sessions recorded" description="Student sessions will appear here." className="py-10" />
              )}
            </Panel>
          </div>

          <aside className="min-w-0 space-y-6">
            <Panel className="p-5">
              <p className="label-mono mb-2">Your role</p>
              <p className="text-sm font-medium text-ink">{user.title ?? user.role}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                {isTechnician
                  ? "You can update equipment status and record inspections."
                  : isAdmin
                    ? "You can approve students, grant laboratory access and manage equipment."
                    : "You can review students, experiments and results."}
              </p>
              {isAdmin ? (
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/institution/students" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                    Students →
                  </Link>
                  <Link href="/institution/results" className="text-xs font-medium text-cobalt hover:text-cobalt-deep">
                    Results →
                  </Link>
                </div>
              ) : null}
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}
