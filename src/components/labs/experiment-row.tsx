import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { accentTheme } from "@/components/labs/lab-accent";
import { Badge, ExperimentStatusBadge, ProgressBar } from "@/components/ui";
import { LAB_BY_ID } from "@/lib/data/labs";
import { relativeTime } from "@/lib/utils/cn";
import type { Experiment, ExperimentProgress } from "@/types";

export function ExperimentRow({
  experiment,
  progress,
  href,
  showLab = false,
}: {
  experiment: Experiment;
  progress?: ExperimentProgress | null;
  href: string;
  showLab?: boolean;
}) {
  const lab = LAB_BY_ID[experiment.labId];
  const theme = accentTheme(lab.accent);
  const status = progress?.status ?? "not-started";
  const done = progress?.completedSteps.length ?? 0;
  const pct = (done / 5) * 100;

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 border-b border-line px-4 py-4 transition-colors duration-150 last:border-b-0 hover:bg-surface-raised sm:flex-row sm:items-center sm:gap-5 sm:px-5"
    >
      <span className={`hidden h-10 w-1 shrink-0 rounded-full sm:block ${theme.bg}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
            {experiment.code}
          </span>
          {showLab ? (
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              · {lab.shortName}
            </span>
          ) : null}
          <Badge tone="neutral">{experiment.difficulty}</Badge>
        </div>
        <h3 className="mt-1.5 text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-ink">
          {experiment.shortTitle}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
          <Clock3 className="size-3.5" strokeWidth={1.8} aria-hidden />
          {experiment.durationMinutes} min
          {progress?.updatedAt ? <span>· updated {relativeTime(progress.updatedAt)}</span> : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:w-56">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <ExperimentStatusBadge status={status} />
            <span className="font-mono text-[0.5625rem] tabular text-ink-faint">{done}/5</span>
          </div>
          <ProgressBar value={pct} tone={theme.bar} label={`${experiment.shortTitle} progress`} />
        </div>
        <ArrowRight
          className="size-4 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
          aria-hidden
        />
      </div>
    </Link>
  );
}
