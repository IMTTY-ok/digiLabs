import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line bg-surface/45", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 lg:py-11">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
          <div className="min-w-0 max-w-3xl">
            {eyebrow ? <div className="mb-3 flex flex-wrap items-center gap-3">{eyebrow}</div> : null}
            <h1 className="display-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.4rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
                {description}
              </p>
            ) : null}
            {meta ? <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">{meta}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </header>
  );
}

export function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">{label}</span>
      <span className="text-xs font-medium text-ink-soft">{value}</span>
    </div>
  );
}
