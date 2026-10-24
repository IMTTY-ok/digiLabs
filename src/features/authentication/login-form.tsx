"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

import { signIn, type SignInState } from "@/features/authentication/actions";
import { DEMO_ACCOUNTS, DEMO_PASSWORD_HINT } from "@/lib/auth/demo-accounts";
import { Alert, Badge, Button, Field, Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type Intent = "student" | "institution";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(signIn, {});
  const [intent, setIntent] = useState<Intent>("student");
  const [email, setEmail] = useState("arjun.mehta@student.northline.edu");
  const [password, setPassword] = useState(DEMO_PASSWORD_HINT);

  function useAccount(accountEmail: string, role: string) {
    setEmail(accountEmail);
    setPassword(DEMO_PASSWORD_HINT);
    setIntent(role === "student" ? "student" : "institution");
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label-mono">Institution sign-in</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink">Pick up where you left off.</h1>
        </div>
        <span className="hidden size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft sm:inline-flex">
          <LockKeyhole className="size-4" strokeWidth={1.8} aria-hidden />
        </span>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
        Use a seeded demo account below. The password is checked on the server and all access is scoped to
        Northline Institute.
      </p>

      <div
        className="mt-7 grid grid-cols-2 gap-1 rounded-md border border-line bg-surface-raised p-1"
        role="group"
        aria-label="Account type"
      >
        {(
          [
            { id: "student", label: "Student", hint: "Dashboard" },
            { id: "institution", label: "Institution", hint: "Staff" },
          ] as const
        ).map((tab) => {
          const active = intent === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => setIntent(tab.id)}
              className={cn(
                "pressable flex h-11 items-center justify-center gap-2 rounded-sm border text-sm font-medium transition-colors duration-150",
                active
                  ? "border-line bg-surface text-ink shadow-card"
                  : "border-transparent text-ink-soft hover:text-ink",
              )}
            >
              {tab.id === "student" ? (
                <UserRound className="size-4" strokeWidth={1.9} aria-hidden />
              ) : (
                <LockKeyhole className="size-4" strokeWidth={1.9} aria-hidden />
              )}
              {tab.label}
              <span className="hidden font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint sm:inline">
                {tab.hint}
              </span>
            </button>
          );
        })}
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="intent" value={intent} />
        <Field label="Institutional email" htmlFor="email">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.8}
              aria-hidden
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-9"
              placeholder="name@northline.edu"
            />
          </div>
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={
            <>
              Shared demo password: <span className="font-mono text-ink">{DEMO_PASSWORD_HINT}</span>
            </>
          }
        >
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={1.8}
              aria-hidden
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-9"
            />
          </div>
        </Field>

        {state.error ? (
          <Alert tone="danger" title="Sign-in blocked">
            {state.error}
          </Alert>
        ) : null}

        <Button type="submit" size="lg" full disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          {pending ? null : <ArrowRight className="size-4" aria-hidden />}
        </Button>
      </form>

      <div className="mt-8 rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="label-mono">Seeded accounts</p>
          <Badge tone="amber">Demo only</Badge>
        </div>
        <ul className="divide-y divide-line">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.8125rem] font-medium text-ink">{account.name}</p>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    {account.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[0.625rem] text-ink-faint">{account.email}</p>
              </div>
              <button
                type="button"
                onClick={() => useAccount(account.email, account.role)}
                className="pressable shrink-0 rounded-sm border border-line-strong bg-surface px-2.5 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
              >
                Use
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-4 py-3 text-[0.6875rem] leading-relaxed text-ink-faint">
          Sara Khan is intentionally pending: signing in with her account should be blocked until an
          administrator approves it.{" "}
          <Link href="/" className="text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
