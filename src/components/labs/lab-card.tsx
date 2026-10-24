import Link from "next/link";
import { ArrowUpRight, FlaskConical, LockKeyhole } from "lucide-react";

import { accentTheme } from "@/components/labs/lab-accent";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { Laboratory } from "@/types";

export function LabCard({
  lab,
  experimentCount,
  accessible,
  href,
  compact = false,
}: {
  lab: Laboratory;
  experimentCount: number;
  accessible: boolean;
  href: string;
  compact?: boolean;
}) {
  const theme = accentTheme(lab.accent);

  return (
    <article
      className={cn(
        "panel hover-lift group relative flex flex-col overflow-hidden transition-transform duration-200",
        compact ? "p-5" : "p-6",
      )}
    >
      <div className={`absolute inset-x-0 top-0 h-[3px] ${theme.bg}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">{lab.code}</p>
        {accessible ? (
          <Badge tone="ok" dot>
            Access granted
          </Badge>
        ) : (
          <Badge tone="neutral">
            <LockKeyhole className="size-2.5" aria-hidden />
            Locked
          </Badge>
        )}
      </div>

      <h3 className={cn("mt-4 font-semibold tracking-[-0.015em] text-ink", compact ? "text-lg" : "text-xl")}>
        {lab.name}
      </h3>
      <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">{lab.room}</p>

      {!compact ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{lab.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <FlaskConical className="size-3.5 text-ink-faint" strokeWidth={1.8} aria-hidden />
          {experimentCount} experiments
        </span>
      </div>

      {accessible ? (
        <Link
          href={href}
          className={cn(
            "mt-4 inline-flex items-center justify-between gap-2 rounded-sm border px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors duration-150",
            theme.borderSoft,
            theme.bgSoft,
            theme.textDeep,
            "hover:border-current",
          )}
        >
          Enter laboratory
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      ) : (
        <p className="mt-4 rounded-sm border border-line bg-surface-raised px-3.5 py-2.5 text-xs leading-relaxed text-ink-faint">
          Access is granted by your institution. Contact the registrar or your instructor.
        </p>
      )}
    </article>
  );
}
