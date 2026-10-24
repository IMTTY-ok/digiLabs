"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, LockKeyhole, Search, ShieldAlert, UserRound, X } from "lucide-react";

import { AccountStatusBadge, Alert, Avatar, Badge, Button, Input } from "@/components/ui";
import { setLabAccess, setStudentStatus } from "@/features/institution/actions";
import { cn } from "@/lib/utils/cn";
import type { AccountStatus, LabId } from "@/types";

export interface StudentDirectoryItem {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  stream: string;
  status: AccountStatus;
  createdAt: string;
  labs: LabId[];
  assigned: number;
  completed: number;
  bestScore: string | null;
  observations: number;
}

const LABS: { id: LabId; short: string }[] = [
  { id: "chemistry", short: "Chem" },
  { id: "electronics", short: "Elec" },
  { id: "it-workshop", short: "IT" },
];

export function StudentDirectory({
  students,
  canManage,
}: {
  students: StudentDirectoryItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger" | "info"; text: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const pendingStudents = students.filter((student) => student.status === "pending");

  const filtered = students.filter((student) => {
    const matchesQuery =
      !query ||
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  async function changeStatus(studentId: string, status: AccountStatus) {
    setBusyId(studentId);
    startTransition(async () => {
      const result = await setStudentStatus(studentId, status);
      setBusyId(null);
      setMessage({
        tone: result.ok ? "success" : "danger",
        text: result.message ?? (result.ok ? "Updated." : "Could not update."),
      });
      if (result.ok) router.refresh();
    });
  }

  async function toggleLab(studentId: string, labId: LabId, granted: boolean) {
    setBusyId(studentId);
    startTransition(async () => {
      const result = await setLabAccess(studentId, labId, granted);
      setBusyId(null);
      setMessage({
        tone: result.ok ? "success" : "danger",
        text: result.message ?? (result.ok ? "Updated." : "Could not update."),
      });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div
          className={cn(
            "rounded-sm border px-4 py-3 text-sm",
            message.tone === "success"
              ? "border-ok/25 bg-ok-wash text-ok"
              : message.tone === "danger"
                ? "border-danger/25 bg-danger-wash text-danger"
                : "border-cobalt/20 bg-cobalt/[0.05] text-cobalt-deep",
          )}
          role={message.tone === "danger" ? "alert" : undefined}
        >
          {message.text}
        </div>
      ) : null}

      {pendingStudents.length > 0 ? (
        <div className="rounded-sm border border-amber/30 bg-amber-wash px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber">
                {pendingStudents.length} pending approval{pendingStudents.length === 1 ? "" : "s"}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                New accounts cannot sign in until approved.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Review pending
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or roll number"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "active", "pending", "suspended"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] transition-colors duration-150",
                statusFilter === status
                  ? "border-ink bg-ink text-paper"
                  : "border-line-strong bg-surface text-ink-soft hover:border-ink-faint",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-raised text-left">
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Student
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Status
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Labs
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Progress
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Best score
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const busy = busyId === student.id || pending;
                return (
                  <tr key={student.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" tone="navy" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{student.name}</p>
                          <p className="mt-0.5 truncate font-mono text-[0.5625rem] text-ink-faint">
                            {student.email}
                          </p>
                          <p className="mt-0.5 font-mono text-[0.5625rem] text-ink-faint">
                            {student.rollNo} · {student.stream}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <AccountStatusBadge status={student.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {LABS.map((lab) => {
                          const granted = student.labs.includes(lab.id);
                          if (!canManage) {
                            return granted ? (
                              <Badge key={lab.id} tone="cobalt">
                                {lab.short}
                              </Badge>
                            ) : null;
                          }
                          return (
                            <button
                              key={lab.id}
                              type="button"
                              disabled={busy}
                              onClick={() => toggleLab(student.id, lab.id, !granted)}
                              aria-pressed={granted}
                              className={cn(
                                "rounded-full border px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] transition-colors duration-150 disabled:opacity-50",
                                granted
                                  ? "border-cobalt/30 bg-cobalt/[0.08] text-cobalt-deep"
                                  : "border-line-strong bg-surface text-ink-faint hover:border-ink-faint",
                              )}
                            >
                              {lab.short}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-mono tabular text-ink">
                        {student.completed}/{student.assigned}
                      </p>
                      <p className="mt-0.5 text-[0.625rem] text-ink-faint">
                        {student.observations} observation{student.observations === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-mono tabular text-ink">
                      {student.bestScore ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {canManage ? (
                        <div className="flex flex-wrap gap-1.5">
                          {student.status !== "active" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={busy}
                              onClick={() => changeStatus(student.id, "active")}
                            >
                              <Check className="size-3.5" aria-hidden />
                              Approve
                            </Button>
                          ) : null}
                          {student.status !== "suspended" ? (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={busy}
                              onClick={() => changeStatus(student.id, "suspended")}
                            >
                              <ShieldAlert className="size-3.5" aria-hidden />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={busy}
                              onClick={() => changeStatus(student.id, "active")}
                            >
                              <UserRound className="size-3.5" aria-hidden />
                              Reactivate
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-faint">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-soft">
                    No students match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
