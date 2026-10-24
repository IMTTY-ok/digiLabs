"use client";

import { SourceBadge } from "@/components/ui";
import type { ObservationRecord } from "@/types";
import { OBSERVATION_COLUMNS, formatObservationValue } from "@/features/experiments/observation-labels";
import { formatDate } from "@/lib/utils/cn";

export function ObservationTable({
  experimentId,
  records,
}: {
  experimentId: string;
  records: ObservationRecord[];
}) {
  const columns = OBSERVATION_COLUMNS[experimentId as keyof typeof OBSERVATION_COLUMNS] ?? [];
  const keys = columns.length
    ? columns.map((column) => column.key)
    : Array.from(new Set(records.flatMap((record) => Object.keys(record.values))));

  if (records.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line bg-surface-raised px-4 py-6 text-center">
        <p className="text-sm font-medium text-ink">No observations recorded yet</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          Run the simulation and record a reading to populate this table.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-raised">
            <th className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              #
            </th>
            <th className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              Recorded
            </th>
            {columns.length
              ? columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint"
                  >
                    {column.label}
                    {column.unit ? ` (${column.unit})` : ""}
                  </th>
                ))
              : keys.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint"
                  >
                    {key}
                  </th>
                ))}
            <th className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              Source
            </th>
            <th className="px-4 py-2.5 text-left font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              Note
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr key={record.id} className="border-b border-line last:border-b-0">
              <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">{index + 1}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                {formatDate(record.createdAt, true)}
              </td>
              {columns.length
                ? columns.map((column) => (
                    <td key={column.key} className="px-4 py-2.5 font-mono tabular text-ink">
                      {formatObservationValue(record.values[column.key], column.decimals)}
                    </td>
                  ))
                : keys.map((key) => (
                    <td key={key} className="px-4 py-2.5 font-mono tabular text-ink">
                      {formatObservationValue(record.values[key])}
                    </td>
                  ))}
              <td className="px-4 py-2.5">
                <SourceBadge source={record.source} />
              </td>
              <td className="px-4 py-2.5 text-xs text-ink-soft">{record.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
