"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ClipboardList,
  Compass,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import { Brand } from "@/components/layout/brand";
import { Avatar, Badge } from "@/components/ui";
import { signOut } from "@/features/authentication/actions";
import { cn } from "@/lib/utils/cn";
import type { Role, SessionUser } from "@/types";

const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  instructor: "Instructor",
  admin: "Administrator",
  technician: "Technician",
};

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

function navForRole(role: Role): NavItem[] {
  const labs: NavItem = { href: "/labs", label: "Laboratories", icon: FlaskConical };
  const campus: NavItem = { href: "/campus", label: "Campus", icon: Compass };

  if (role === "student") {
    return [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      campus,
      labs,
    ];
  }

  const overview: NavItem = {
    href: "/institution",
    label: "Overview",
    icon: Building2,
    exact: true,
  };
  if (role === "technician") {
    return [
      overview,
      { href: "/institution/equipment", label: "Equipment", icon: Wrench },
      labs,
      campus,
    ];
  }
  return [
    overview,
    { href: "/institution/students", label: "Students", icon: Users },
    { href: "/institution/equipment", label: "Equipment", icon: Wrench },
    { href: "/institution/results", label: "Results", icon: ClipboardList },
    { href: "/institution/reports", label: "Reports", icon: BarChart3 },
    labs,
    campus,
  ];
}

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({
  user,
  institutionName,
  children,
}: {
  user: SessionUser;
  institutionName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = navForRole(user.role);

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-navy px-4 py-2 text-sm text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Brand href={user.role === "student" ? "/dashboard" : "/institution"} />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-sm px-3 text-[0.8125rem] font-medium transition-colors duration-150",
                    active
                      ? "bg-ink/[0.06] text-ink"
                      : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.9} aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[0.8125rem] font-medium leading-tight text-ink">{user.name}</p>
              <p className="mt-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
                {institutionName} · {ROLE_LABEL[user.role]}
              </p>
            </div>
            <Avatar name={user.name} size="md" tone={user.role === "student" ? "navy" : "cobalt"} />
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                aria-label="Sign out"
                className="pressable inline-flex size-9 items-center justify-center rounded-sm border border-line-strong bg-surface text-ink-soft transition-colors duration-150 hover:border-ink-faint hover:text-ink"
              >
                <LogOut className="size-4" strokeWidth={1.9} aria-hidden />
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Primary mobile"
          className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line/70 px-3 py-2 lg:hidden"
        >
          {items.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-sm px-3 text-xs font-medium transition-colors duration-150",
                  active ? "bg-ink/[0.07] text-ink" : "text-ink-soft hover:bg-ink/[0.04]",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.9} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <Badge tone="neutral" className="my-auto ml-auto shrink-0 sm:hidden">
            {ROLE_LABEL[user.role]}
          </Badge>
        </nav>
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="mt-16 border-t border-line bg-surface/60">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="size-1.5 rounded-full bg-amber" aria-hidden />
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">
              Demo environment · readings are simulated, not hardware
            </p>
          </div>
          <p className="text-xs text-ink-faint">
            {institutionName} · Session data is stored in the local demo repository.
          </p>
        </div>
      </footer>
    </div>
  );
}
