import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-faint">
          404 · Not found
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">
          That page does not exist.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The route may have moved, or the laboratory or experiment may not be available.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/" variant="secondary">
            <Home className="size-4" aria-hidden />
            Home
          </ButtonLink>
          <ButtonLink href="/dashboard">
            <Compass className="size-4" aria-hidden />
            Dashboard
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
