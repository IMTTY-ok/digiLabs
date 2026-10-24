import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { buttonClass } from "@/components/ui";

const LINKS = [
  { href: "#laboratories", label: "Laboratories" },
  { href: "#campus", label: "Campus" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "For institutions" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-8 px-4 sm:px-6">
        <Brand href="/" subtitle="Northline demo" />
        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}>
            Sign in
          </Link>
          <Link href="/login" className={buttonClass("primary", "sm")}>
            Enter demo
          </Link>
        </div>
      </div>
    </header>
  );
}
