import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn, initials } from "@/lib/utils/cn";
import type { AccountStatus, EquipmentStatus, ExperimentStatus } from "@/types";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger"
  | "inverse"
  | "outline-inverse";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "border-cobalt bg-cobalt text-white hover:border-cobalt-deep hover:bg-cobalt-deep shadow-[0_1px_0_rgba(255,255,255,0.16)_inset]",
  secondary: "border-line-strong bg-surface text-ink hover:border-ink-faint hover:bg-surface-raised",
  ghost: "border-transparent bg-transparent text-ink-soft hover:bg-ink/[0.06] hover:text-ink",
  subtle: "border-transparent bg-ink/[0.06] text-ink hover:bg-ink/[0.1]",
  danger: "border-danger/25 bg-danger-wash text-danger hover:border-danger/45 hover:bg-danger/[0.12]",
  inverse: "border-transparent bg-surface text-navy hover:bg-white",
  "outline-inverse": "border-white/25 bg-white/[0.04] text-paper hover:border-white/40 hover:bg-white/10",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-[0.8125rem]",
  lg: "h-12 gap-2 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "pressable inline-flex select-none items-center justify-center rounded-sm border font-medium leading-none",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

export function Button({ variant = "primary", size = "md", full, className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, cn(full && "w-full", className))} {...props} />;
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, cn(full && "w-full", className))} {...props} />
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export type BadgeTone =
  | "neutral"
  | "cobalt"
  | "cyan"
  | "amber"
  | "ok"
  | "warn"
  | "danger"
  | "navy"
  | "inverse";

const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-raised text-ink-soft",
  cobalt: "border-cobalt/25 bg-cobalt/[0.07] text-cobalt-deep",
  cyan: "border-cyan/25 bg-cyan-wash text-cyan",
  amber: "border-amber/30 bg-amber-wash text-amber",
  ok: "border-ok/25 bg-ok-wash text-ok",
  warn: "border-amber/30 bg-amber-wash text-amber",
  danger: "border-danger/25 bg-danger-wash text-danger",
  navy: "border-navy/15 bg-navy/[0.06] text-navy",
  inverse: "border-white/20 bg-white/10 text-paper",
};

const DOT_TONE: Record<BadgeTone, string> = {
  neutral: "bg-ink-faint",
  cobalt: "bg-cobalt",
  cyan: "bg-cyan",
  amber: "bg-amber",
  ok: "bg-ok",
  warn: "bg-amber",
  danger: "bg-danger",
  navy: "bg-navy",
  inverse: "bg-paper",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[0.625rem] font-medium uppercase leading-4 tracking-[0.12em]",
        BADGE_TONE[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", DOT_TONE[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}

const EQUIPMENT_STATUS: Record<EquipmentStatus, { label: string; tone: BadgeTone }> = {
  available: { label: "Available", tone: "ok" },
  "in-use": { label: "In use", tone: "cobalt" },
  "session-ended": { label: "Session ended", tone: "neutral" },
  "inspection-due": { label: "Inspection due", tone: "warn" },
  warning: { label: "Warning", tone: "warn" },
  unavailable: { label: "Unavailable", tone: "danger" },
};

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  const item = EQUIPMENT_STATUS[status];
  return <Badge tone={item.tone} dot>{item.label}</Badge>;
}

const ACCOUNT_STATUS: Record<AccountStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "ok" },
  pending: { label: "Pending", tone: "warn" },
  suspended: { label: "Suspended", tone: "danger" },
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const item = ACCOUNT_STATUS[status];
  return <Badge tone={item.tone} dot>{item.label}</Badge>;
}

const EXPERIMENT_STATUS: Record<ExperimentStatus, { label: string; tone: BadgeTone }> = {
  "not-started": { label: "Not started", tone: "neutral" },
  "in-progress": { label: "In progress", tone: "cobalt" },
  completed: { label: "Completed", tone: "ok" },
};

export function ExperimentStatusBadge({ status }: { status: ExperimentStatus }) {
  const item = EXPERIMENT_STATUS[status];
  return <Badge tone={item.tone} dot>{item.label}</Badge>;
}

export function SourceBadge({ source }: { source: "simulation" | "record" | "sensor" | "simulated" | "student-entered" | "instructor-provided" }) {
  const map = {
    simulation: { label: "Simulated", tone: "cyan" as const },
    simulated: { label: "Simulated", tone: "cyan" as const },
    record: { label: "Record", tone: "neutral" as const },
    sensor: { label: "Sensor", tone: "ok" as const },
    "student-entered": { label: "Student entered", tone: "amber" as const },
    "instructor-provided": { label: "Instructor", tone: "navy" as const },
  };
  const item = map[source];
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel", className)}>{children}</div>;
}

export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="label-mono mb-2">{eyebrow}</p> : null}
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="label-mono mb-3">{eyebrow}</p> : null}
        <h2 className="display-balance text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[1.7rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

export function Stat({
  label,
  value,
  unit,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="label-mono">{label}</dt>
      <dd className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular text-[1.6rem] font-semibold leading-none tracking-[-0.02em] text-ink">
          {value}
        </span>
        {unit ? <span className="font-mono text-xs text-ink-faint">{unit}</span> : null}
      </dd>
      {hint ? <p className="mt-1.5 text-xs leading-snug text-ink-faint">{hint}</p> : null}
    </div>
  );
}

const PROGRESS_TONE = {
  cobalt: "bg-cobalt",
  cyan: "bg-cyan",
  amber: "bg-amber",
  ok: "bg-ok",
  navy: "bg-navy",
} as const;

export function ProgressBar({
  value,
  tone = "cobalt",
  label,
  className,
}: {
  value: number;
  tone?: keyof typeof PROGRESS_TONE;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label ?? "Progress"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("h-1.5 overflow-hidden rounded-full bg-ink/[0.08]", className)}
    >
      <div
        className={cn("h-full w-full origin-left rounded-full transition-transform duration-300", PROGRESS_TONE[tone])}
        style={{ transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  );
}

export function Avatar({
  name,
  size = "md",
  tone = "navy",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "navy" | "cobalt" | "cyan" | "amber";
}) {
  const sizes = { sm: "size-7 text-[0.625rem]", md: "size-9 text-[0.6875rem]", lg: "size-11 text-xs" };
  const tones = {
    navy: "bg-navy text-paper",
    cobalt: "bg-cobalt text-white",
    cyan: "bg-cyan text-white",
    amber: "bg-amber text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium tracking-[0.08em]",
        sizes[size],
        tones[tone],
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Alerts & empty states                                               */
/* ------------------------------------------------------------------ */

export function Alert({
  tone = "info",
  title,
  children,
  className,
  action,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  const tones = {
    info: "border-cobalt/20 bg-cobalt/[0.05] text-cobalt-deep",
    success: "border-ok/25 bg-ok-wash text-ok",
    warning: "border-amber/30 bg-amber-wash text-amber",
    danger: "border-danger/25 bg-danger-wash text-danger",
  };
  return (
    <div className={cn("rounded-sm border px-4 py-3 text-sm", tones[tone], className)} role={tone === "danger" ? "alert" : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={cn("leading-relaxed", title && "mt-1", "text-ink-soft")}>{children}</div>
        </div>
        {action}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon ? <div className="mb-3 text-ink-faint">{icon}</div> : null}
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

export const fieldClass =
  "h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint/80 hover:border-ink-faint focus:border-cobalt focus:outline-none focus-visible:outline-none";

export const textareaClass =
  "min-h-24 w-full resize-y rounded-sm border border-line-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-ink-faint/80 hover:border-ink-faint focus:border-cobalt focus:outline-none focus-visible:outline-none";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, "appearance-none pr-8", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(textareaClass, className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
