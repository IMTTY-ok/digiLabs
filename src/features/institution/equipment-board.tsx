"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, ShieldCheck, Wrench } from "lucide-react";

import {
  Badge,
  Button,
  EquipmentStatusBadge,
  Input,
  Select,
} from "@/components/ui";
import { recordInspection, updateEquipmentStatus } from "@/features/institution/actions";
import { cn } from "@/lib/utils/cn";
import type { EquipmentStatus } from "@/types";

export interface EquipmentBoardItem {
  id: string;
  labId: string;
  labShort: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  source: "simulation" | "record" | "sensor";
  lastInspection: string;
  nextInspection: string;
  note?: string;
}

const STATUSES: EquipmentStatus[] = [
  "available",
  "in-use",
  "session-ended",
  "inspection-due",
  "warning",
  "unavailable",
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function EquipmentBoard({
  items,
  canManage,
}: {
  items: EquipmentBoardItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [labFilter, setLabFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<EquipmentStatus>("available");
  const [noteDraft, setNoteDraft] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const labs = Array.from(new Set(items.map((item) => item.labId)));

  const filtered = items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    const matchesLab = labFilter === "all" || item.labId === labFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesQuery && matchesLab && matchesStatus;
  });

  function openEditor(item: EquipmentBoardItem) {
    setExpandedId(item.id);
    setStatusDraft(item.status);
    setNoteDraft(item.note ?? "");
  }

  async function saveStatus(itemId: string) {
    setBusyId(itemId);
    startTransition(async () => {
      const result = await updateEquipmentStatus(itemId, statusDraft, noteDraft);
      setBusyId(null);
      setMessage({
        tone: result.ok ? "success" : "danger",
        text: result.message ?? (result.ok ? "Updated." : "Could not update."),
      });
      if (result.ok) {
        setExpandedId(null);
        router.refresh();
      }
    });
  }

  async function inspect(itemId: string) {
    setBusyId(itemId);
    startTransition(async () => {
      const result = await recordInspection(itemId, noteDraft);
      setBusyId(null);
      setMessage({
        tone: result.ok ? "success" : "danger",
        text: result.message ?? (result.ok ? "Recorded." : "Could not record."),
      });
      if (result.ok) {
        setExpandedId(null);
        router.refresh();
      }
    });
  }

  const attentionCount = items.filter((item) =>
    ["inspection-due", "warning", "unavailable"].includes(item.status),
  ).length;

  return (
    <div className="space-y-5">
      {message ? (
        <div
          className={cn(
            "rounded-sm border px-4 py-3 text-sm",
            message.tone === "success"
              ? "border-ok/25 bg-ok-wash text-ok"
              : "border-danger/25 bg-danger-wash text-danger",
          )}
          role={message.tone === "danger" ? "alert" : undefined}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or category"
            className="pl-9"
          />
        </div>
        <Select value={labFilter} onChange={(event) => setLabFilter(event.target.value)}>
          <option value="all">All labs</option>
          {labs.map((lab) => {
            const sample = items.find((item) => item.labId === lab);
            return (
              <option key={lab} value={lab}>
                {sample?.labShort ?? lab}
              </option>
            );
          })}
        </Select>
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace("-", " ")}
            </option>
          ))}
        </Select>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-raised text-left">
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Item
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Lab
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Status
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Last inspection
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Next due
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Source
                </th>
                <th className="px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const expanded = expandedId === item.id;
                const busy = busyId === item.id || pending;
                return (
                  <tr key={item.id} className="border-b border-line last:border-b-0 align-top">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{item.category}</p>
                      {item.note ? (
                        <p className="mt-1.5 text-xs leading-snug text-ink-soft">{item.note}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{item.labShort}</td>
                    <td className="px-5 py-3.5">
                      <EquipmentStatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                      {formatDate(item.lastInspection)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                      {formatDate(item.nextInspection)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={item.source === "record" ? "neutral" : "cyan"}>
                        {item.source}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {canManage ? (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => (expanded ? setExpandedId(null) : openEditor(item))}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-cobalt hover:text-cobalt-deep"
                          >
                            <ChevronDown
                              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
                              aria-hidden
                            />
                            {expanded ? "Close" : "Manage"}
                          </button>
                          {expanded ? (
                            <div className="mt-2 space-y-2 rounded-sm border border-line bg-surface-raised p-3">
                              <Select
                                value={statusDraft}
                                onChange={(event) => setStatusDraft(event.target.value as EquipmentStatus)}
                              >
                                {STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status.replace("-", " ")}
                                  </option>
                                ))}
                              </Select>
                              <input
                                value={noteDraft}
                                onChange={(event) => setNoteDraft(event.target.value)}
                                placeholder="Note (optional)"
                                className="h-9 w-full rounded-sm border border-line-strong bg-surface px-3 text-xs text-ink focus:border-cobalt focus:outline-none"
                              />
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => saveStatus(item.id)}
                                >
                                  <Wrench className="size-3.5" aria-hidden />
                                  {busy ? "Saving…" : "Update status"}
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => inspect(item.id)}
                                >
                                  <ShieldCheck className="size-3.5" aria-hidden />
                                  Record inspection
                                </Button>
                              </div>
                            </div>
                          ) : null}
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
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-ink-soft">
                    No equipment matches the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-sm border border-line bg-surface-raised px-4 py-3">
        <p className="text-xs leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">{attentionCount}</span> item
          {attentionCount === 1 ? "" : "s"} currently need attention. Inspection records update
          last/next inspection dates and clear inspection-due or warning flags.
        </p>
      </div>
    </div>
  );
}
