import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { CampusPlan } from "@/components/marketing/campus-plan";
import { SiteHeader } from "@/components/marketing/site-header";
import { Brand } from "@/components/layout/brand";
import { Badge, ButtonLink, buttonClass } from "@/components/ui";
import { LABORATORIES } from "@/lib/data/labs";
import { EXPERIMENTS } from "@/lib/data/experiments";
import { DEMO_ACCOUNTS, DEMO_PASSWORD_HINT } from "@/lib/auth/demo-accounts";
import { accentTheme } from "@/components/labs/lab-accent";

const ROLE_CARDS = [
  {
    role: "Student",
    icon: GraduationCap,
    copy: "Walk the campus, run the assigned experiments, record simulated readings and take the assessment.",
    points: ["Institution-granted lab access", "Saved progress and readings", "Server-marked assessments"],
  },
  {
    role: "Instructor",
    icon: BookOpen,
    copy: "See how each cohort is progressing, inspect experiment content and preview the simulations.",
    points: ["Cohort progress matrix", "Quiz scores and attempts", "Read-only experiment preview"],
  },
];

export default function LandingPage() {
  const published = EXPERIMENTS.filter((experiment) => experiment.published);

  return (
    <div className="min-h-svh bg-paper">
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="ledger pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden />
          <div className="pointer-events-none absolute -right-32 -top-24 size-[28rem] rounded-full bg-cobalt/[0.05] blur-3xl" aria-hidden />
          <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pb-24 lg:pt-20">
            <div className="rise-in min-w-0">
              <p className="label-mono flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-ok soft-pulse" aria-hidden />
                Northline Institute of Engineering · Demo
              </p>
              <h1 className="display-balance mt-6 max-w-2xl text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl lg:text-[4.1rem]">
                A laboratory you can walk into.
                <span className="mt-2 block text-ink-soft">From anywhere.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">
                LabSafe is a browser-based virtual laboratory for first-year B.Tech students. Explore a
                three-block campus, run guided chemistry and electronics experiments, and record readings
                that are labelled as simulated — every time.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/login" size="lg">
                  Enter the demo
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <a href="#campus" className={buttonClass("secondary", "lg")}>
                  See the campus
                </a>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
                {[
                  { label: "Laboratories", value: String(LABORATORIES.length) },
                  { label: "Guided experiments", value: String(published.length) },
                  { label: "Account roles", value: "2" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="label-mono">{item.label}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-ink">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 flex items-center gap-2 text-xs text-ink-faint">
                <ShieldCheck className="size-4 text-ok" strokeWidth={1.8} aria-hidden />
                Institution-controlled access. No installation. Demo credentials below.
              </p>
            </div>

            <div className="relative min-w-0 lg:pl-2">
              <div className="relative overflow-hidden rounded-lg border border-line-strong/60 bg-navy shadow-[0_30px_80px_-40px_rgba(15,27,45,0.65)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/60">
                    Campus plan · Blocks A–C
                  </p>
                  <span className="flex items-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/50">
                    <span className="size-1.5 rounded-full bg-[#57b7c2]" aria-hidden />
                    Live demo
                  </span>
                </div>
                <CampusPlan activeId="electronics" idPrefix="landing" className="block h-auto w-full" />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">
                    NIE-014 · Pune, Maharashtra
                  </p>
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/45">
                    3 blocks · 1 plaza
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute -left-3 top-16 hidden w-44 rounded-md border border-line bg-surface p-3 shadow-float xl:block">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                    KVL · loop check
                  </span>
                  <span className="size-1.5 rounded-full bg-cyan" aria-hidden />
                </div>
                <p className="mt-2 font-mono text-lg font-medium tabular tracking-tight text-ink">ΣV = 0.000 V</p>
                <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-cyan">
                  Simulated reading
                </p>
              </div>

              <div className="pointer-events-none absolute -right-2 bottom-12 hidden w-48 rounded-md border border-line bg-surface p-3 shadow-float xl:block">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                    Titration · endpoint
                  </span>
                  <span className="size-1.5 rounded-full bg-cobalt" aria-hidden />
                </div>
                <p className="mt-2 font-mono text-lg font-medium tabular tracking-tight text-ink">25.60 mL</p>
                <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-cobalt">
                  Trial 01 recorded
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Laboratories */}
        <section id="laboratories" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="label-mono">01 / Laboratories</p>
              <h2 className="display-balance mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
                Three laboratories. One continuous session.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Each block is provisioned with its own experiments, equipment register and safety record.
                Access is granted per student by the institution — not by a public link.
              </p>
            </div>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-faint">
              {published.length} experiments · {LABORATORIES.length} blocks
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {LABORATORIES.map((lab, index) => {
              const theme = accentTheme(lab.accent);
              const experiments = published.filter((experiment) => experiment.labId === lab.id);
              return (
                <article
                  key={lab.id}
                  className="panel hover-lift group relative flex flex-col overflow-hidden p-6 transition-transform duration-200"
                >
                  <div className={`absolute inset-x-0 top-0 h-[3px] ${theme.bg}`} aria-hidden />
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-faint">
                      0{index + 1} · {lab.code}
                    </p>
                    <Badge tone="neutral">Provisioned</Badge>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.015em] text-ink">{lab.name}</h3>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">
                    {lab.room}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{lab.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {lab.focus.map((focus) => (
                      <li
                        key={focus}
                        className="rounded-full border border-line bg-surface-raised px-2.5 py-1 text-[0.6875rem] text-ink-soft"
                      >
                        {focus}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">
                      {experiments.length} experiments · {lab.capacity} seats
                    </p>
                    <Link
                      href={`/labs/${lab.id}`}
                      className={`inline-flex items-center gap-1.5 text-[0.8125rem] font-medium ${theme.textDeep} transition-opacity hover:opacity-75`}
                    >
                      Open lab
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Campus */}
        <section id="campus" className="scroll-mt-20 border-y border-line bg-surface/55">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
            <div>
              <p className="label-mono">02 / The campus</p>
              <h2 className="display-balance mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
                Walk the site before you touch a bench.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                The campus is a real 3D scene, not a background image. Orbit the plaza, read each block&apos;s
                provisioned experiments, then step into the laboratory you have been granted.
              </p>
              <ul className="mt-7 space-y-4">
                {[
                  {
                    icon: MapPin,
                    title: "Three destinations",
                    detail: "Chemistry, Electronics and IT Workshop, each with a distinct equipment register.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Access is checked server-side",
                    detail: "A building you cannot enter is shown as locked, with the reason stated plainly.",
                  },
                  {
                    icon: ClipboardCheck,
                    title: "Sessions are recorded",
                    detail: "Starting and ending a session logs an audit event against the lab.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex gap-3.5">
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-ink-soft">
                        <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-7">
                <ButtonLink href="/campus" variant="secondary">
                  Explore the campus
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-lg border border-line-strong/60 bg-navy shadow-card">
                <CampusPlan activeId={null} idPrefix="landing-campus" className="block h-auto w-full" />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                <span>Site plan · schematic</span>
                <span>3D campus available after sign-in</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="label-mono">03 / How it works</p>
            <h2 className="display-balance mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
              One path from sign-in to a recorded result.
            </h2>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Sign in with an institution account",
                copy: "Students see only the laboratories their institution has granted. Pending accounts are blocked at sign-in.",
              },
              {
                step: "02",
                title: "Choose a lab and work the method",
                copy: "Each experiment has an overview, theory, procedure, an interactive simulation and a short assessment.",
              },
              {
                step: "03",
                title: "Record, submit, review",
                copy: "Readings are stored against your account and marked as simulated. Quiz scoring happens on the server.",
              },
            ].map((item) => (
              <li key={item.step} className="bg-surface p-6 sm:p-7">
                <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-cobalt">{item.step}</p>
                <h3 className="mt-5 text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.copy}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
            <FlaskConical className="size-4 text-cyan" strokeWidth={1.8} aria-hidden />
            Simulations run entirely in the browser. No physical apparatus or reagent is connected.
          </p>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 border-y border-line bg-surface/55">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <div className="max-w-2xl">
              <p className="label-mono">04 / For institutions</p>
              <h2 className="display-balance mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
                Two roles, one shared record.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Sign in as each role to see the same institution from a different seat. The demo accounts use
                one shared password and no real identities.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {ROLE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.role} className="panel flex flex-col p-5">
                    <span className="inline-flex size-9 items-center justify-center rounded-sm bg-navy text-paper">
                      <Icon className="size-4.5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-ink">{card.role}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{card.copy}</p>
                    <ul className="mt-4 space-y-1.5 border-t border-line pt-3.5">
                      {card.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-faint" aria-hidden />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Honesty */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="label-mono">05 / Provenance</p>
              <h2 className="display-balance mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl">
                Honest about what this is.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                A virtual lab is useful only if it is clear about its limits. LabSafe separates institutional
                records from simulated readings, and says which is which on every screen.
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-sm border border-amber/30 bg-amber-wash p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber" strokeWidth={1.8} aria-hidden />
                <p className="text-sm leading-relaxed text-ink-soft">
                  <strong className="font-medium text-ink">Not a production LMS.</strong> Demo credentials are
                  public by design. Authentication and the JSON repository must be replaced before any real
                  deployment.
                </p>
              </div>
            </div>
            <dl className="overflow-hidden rounded-lg border border-line bg-surface">
              {[
                {
                  source: "Simulated",
                  tone: "cyan" as const,
                  copy: "Titration volumes, circuit readings and component drills are computed in the browser from a model. No apparatus is connected.",
                },
                {
                  source: "Institution record",
                  tone: "neutral" as const,
                  copy: "Equipment registers, inspections, accounts and assignments are seeded demonstration records maintained by the demo repository.",
                },
                {
                  source: "Sensor",
                  tone: "ok" as const,
                  copy: "Reserved for a future hardware integration. No sensor is connected in this build, so no reading can honestly claim this source.",
                },
              ].map((row) => (
                <div key={row.source} className="grid gap-3 border-b border-line p-5 last:border-b-0 sm:grid-cols-[auto_1fr] sm:gap-5">
                  <div>
                    <Badge tone={row.tone} dot>
                      {row.source}
                    </Badge>
                  </div>
                  <dd className="text-sm leading-relaxed text-ink-soft">{row.copy}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="ledger-dark relative overflow-hidden rounded-lg bg-navy px-6 py-12 text-paper sm:px-10 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-cobalt/30 blur-3xl" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/55">
                  Start in under a minute
                </p>
                <h2 className="display-balance mt-4 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Sign in as a student, instructor, technician or administrator.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65">
                  Every role uses the same seeded password. Start as Arjun Mehta or step into the institution
                  view and approve a pending account.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href="/login" variant="inverse" size="lg">
                    Open the demo
                    <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                  <a href="#laboratories" className={buttonClass("outline-inverse", "lg")}>
                    Browse laboratories
                  </a>
                </div>
              </div>
              <div className="w-full max-w-sm rounded-md border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-white/50">
                  Demo credentials
                </p>
                <p className="mt-2 font-mono text-lg text-paper">{DEMO_PASSWORD_HINT}</p>
                <ul className="mt-4 space-y-2.5">
                  {DEMO_ACCOUNTS.slice(0, 3).map((account) => (
                    <li key={account.email} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-white/70">{account.role === "admin" ? "Institution" : account.label}</span>
                      <span className="truncate font-mono text-[0.625rem] text-white/55">{account.email}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/10 pt-3 text-[0.6875rem] leading-relaxed text-white/45">
                  More accounts, including a pending student, are listed on the sign-in screen.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface/60">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-8 px-4 py-10 sm:px-6">
          <div>
            <Brand href="/" subtitle="Northline demo" />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-faint">
              A demonstration of institution-controlled virtual laboratories for first-year engineering.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 text-sm">
            <div>
              <p className="label-mono">Product</p>
              <ul className="mt-3 space-y-2 text-ink-soft">
                <li><a className="hover:text-ink" href="#laboratories">Laboratories</a></li>
                <li><a className="hover:text-ink" href="#campus">Campus</a></li>
                <li><a className="hover:text-ink" href="#how">How it works</a></li>
              </ul>
            </div>
            <div>
              <p className="label-mono">Access</p>
              <ul className="mt-3 space-y-2 text-ink-soft">
                <li><Link className="hover:text-ink" href="/login">Sign in</Link></li>
                <li><Link className="hover:text-ink" href="/dashboard">Student dashboard</Link></li>
                <li><Link className="hover:text-ink" href="/institution">Institution view</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[0.6875rem] text-ink-faint sm:px-6">
            <p>© 2026 LabSafe Virtual Labs · Demonstration build</p>
            <p className="font-mono uppercase tracking-[0.12em]">Simulated data · No hardware connected</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
