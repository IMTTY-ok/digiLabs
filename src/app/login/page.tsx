import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/layout/brand";
import { CampusPlan } from "@/components/marketing/campus-plan";
import { LoginForm } from "@/features/authentication/login-form";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "student" ? "/dashboard" : "/institution");

  return (
    <div className="grid min-h-svh bg-paper lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-navy p-10 text-paper lg:flex lg:flex-col xl:p-12">
        <div className="ledger-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="pointer-events-none absolute -left-24 bottom-1/3 size-96 rounded-full bg-cobalt/20 blur-3xl" aria-hidden />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark />
            <span>
              <span className="block text-[0.95rem] font-semibold tracking-[-0.015em] text-paper">LabSafe</span>
              <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-white/45">
                Virtual Labs
              </span>
            </span>
          </Link>
        </div>

        <div className="relative mt-auto pt-16">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/50">
            Northline Institute of Engineering
          </p>
          <h2 className="display-balance mt-4 max-w-md text-3xl font-semibold leading-[1.1] tracking-[-0.03em] xl:text-[2.6rem]">
            A campus you can explore before the first practical.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            Sign in to enter the three-block campus, run the apparatus and keep a record of every reading —
            all labelled as simulated.
          </p>

          <div className="mt-8 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <CampusPlan activeId="electronics" idPrefix="login" className="block h-auto w-full opacity-95" />
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Institution-scoped access",
              "Server-marked assessments",
              "Equipment audit trail",
              "Honest simulated data",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-[0.8125rem] text-white/70">
                <ShieldCheck className="size-4 text-[#6fc9a3]" strokeWidth={1.8} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center justify-between border-t border-white/10 pt-5">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/35">
            Demo environment · 2026–27
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80">
            <ArrowLeft className="size-3.5" aria-hidden />
            Public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[0.95rem] font-semibold text-ink">LabSafe</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Public site
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:py-14">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        <div className="border-t border-line px-4 py-4 sm:px-6 lg:px-10">
          <p className="mx-auto max-w-md text-[0.6875rem] leading-relaxed text-ink-faint lg:max-w-none">
            This is a demonstration. Do not enter a real password. The session cookie is signed with a demo
            secret and the repository is a local JSON file.
          </p>
        </div>
      </div>
    </div>
  );
}
