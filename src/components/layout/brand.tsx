import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function BrandMark({ className, framed = true }: { className?: string; framed?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-[7px]",
        framed && "bg-navy shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="M6 18V9" stroke="#1e5bc6" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M12 18V6" stroke="#7fb2ff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18 18v-5.5" stroke="#e0a24a" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4.5 21h15" stroke="#f5f2ea" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Brand({
  href = "/",
  subtitle = "Virtual Labs",
  className,
  compact = false,
}: {
  href?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="leading-none">
        <span className="block text-[0.95rem] font-semibold tracking-[-0.015em] text-ink">DigiLab</span>
        {!compact ? (
          <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-faint">
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
