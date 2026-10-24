"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Box,
  Compass,
  Info,
  LockKeyhole,
  Map as MapIcon,
  MousePointer2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { accentTheme } from "@/components/labs/lab-accent";
import { CampusPlan } from "@/components/marketing/campus-plan";
import { Badge, buttonClass } from "@/components/ui";
import { usePrefersReducedMotion, useWebGLSupport } from "@/components/three/use-webgl";
import { CAMPUS_DESTINATIONS } from "@/lib/data/labs";
import { cn } from "@/lib/utils/cn";
import type { LabId, Role } from "@/types";

const CampusCanvas = dynamic(() => import("@/components/campus/campus-canvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

function CanvasSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0c1626]">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
        <p className="mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/40">
          Building the campus
        </p>
      </div>
    </div>
  );
}

function UnsupportedPanel({ onUsePlan }: { onUsePlan: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/60">
          <MapIcon className="size-5" strokeWidth={1.6} aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-paper">3D is not available in this browser</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">
          WebGL could not start. The schematic site plan carries the same information and links.
        </p>
        <button type="button" onClick={onUsePlan} className={cn(buttonClass("outline-inverse", "sm"), "mt-4")}>
          View site plan
        </button>
      </div>
    </div>
  );
}

export function CampusExplorer({
  access,
  role,
  activeSessionLabId,
  experimentCounts,
}: {
  access: LabId[];
  role: Role;
  activeSessionLabId: LabId | null;
  experimentCounts: Record<LabId, number>;
}) {
  const supported = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();
  const [selectedId, setSelectedId] = useState<LabId | null>(null);
  const [view, setView] = useState<"scene" | "plan">("scene");

  const selected = selectedId
    ? CAMPUS_DESTINATIONS.find((destination) => destination.id === selectedId) ?? null
    : null;
  const selectedTheme = selected ? accentTheme(selected.accent) : null;
  const effectiveView = supported === false ? "plan" : view;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
      <div className="min-w-0">
        <div className="relative overflow-hidden rounded-lg border border-navy/20 bg-[#0c1626] shadow-[0_24px_60px_-34px_rgba(21,33,58,0.7)]">
          <div className="relative aspect-[16/10] min-h-[22rem] w-full sm:min-h-[27rem]">
            {effectiveView === "scene" && supported ? (
              <CampusCanvas
                selectedId={selectedId}
                activeSessionId={activeSessionLabId}
                onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
                animateCamera={!reducedMotion}
              />
            ) : (
              <div className="absolute inset-0 p-3 sm:p-5">
                <CampusPlan
                  activeId={selectedId ?? activeSessionLabId}
                  idPrefix="campus-explorer"
                  className="block h-full w-full"
                />
              </div>
            )}

            {effectiveView === "scene" && supported === false ? (
              <UnsupportedPanel onUsePlan={() => setView("plan")} />
            ) : null}
          </div>

          {/* Top overlay */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0b1421]/80 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
                <Sparkles className="size-3" aria-hidden />
                {effectiveView === "scene" ? "Live 3D campus" : "Site plan"}
              </span>
              {activeSessionLabId ? (
                <span className="hidden items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/15 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-cyan-wash backdrop-blur-sm sm:inline-flex">
                  <span className="size-1.5 animate-pulse rounded-full bg-cyan" aria-hidden />
                  Session open
                </span>
              ) : null}
            </div>

            <div
              className="pointer-events-auto flex rounded-sm border border-white/15 bg-[#0b1421]/85 p-0.5 backdrop-blur-sm"
              role="group"
              aria-label="Campus view"
            >
              <button
                type="button"
                aria-pressed={effectiveView === "scene"}
                onClick={() => setView("scene")}
                disabled={supported === false}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-[3px] px-2.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] transition-colors duration-150 disabled:opacity-40",
                  effectiveView === "scene" ? "bg-white/15 text-white" : "text-white/55 hover:text-white/80",
                )}
              >
                <Box className="size-3" aria-hidden />
                3D
              </button>
              <button
                type="button"
                aria-pressed={effectiveView === "plan"}
                onClick={() => setView("plan")}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-[3px] px-2.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] transition-colors duration-150",
                  effectiveView === "plan" ? "bg-white/15 text-white" : "text-white/55 hover:text-white/80",
                )}
              >
                <MapIcon className="size-3" aria-hidden />
                Plan
              </button>
            </div>
          </div>

          {/* Bottom overlay */}
          {effectiveView === "scene" ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-3 sm:p-4">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b1421]/70 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/50 backdrop-blur-sm">
                <MousePointer2 className="size-3" aria-hidden />
                Drag to orbit · scroll to zoom
              </p>
              {selected ? (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0b1421]/80 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/70 backdrop-blur-sm transition-colors hover:text-white"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Reset view
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Block selector */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Campus blocks">
          {CAMPUS_DESTINATIONS.map((destination) => {
            const theme = accentTheme(destination.accent);
            const active = selectedId === destination.id;
            const accessible = role !== "student" || access.includes(destination.id);
            return (
              <button
                key={destination.id}
                type="button"
                onClick={() => setSelectedId(active ? null : destination.id)}
                aria-pressed={active}
                className={cn(
                  "pressable group flex items-center gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors duration-150",
                  active
                    ? "border-ink-faint bg-surface shadow-card"
                    : "border-line bg-surface/60 hover:border-line-strong hover:bg-surface",
                )}
              >
                <span className={cn("size-2 shrink-0 rounded-full", theme.bg)} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-ink">
                    {destination.shortName}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    {destination.code} · {experimentCounts[destination.id]} exp.
                  </span>
                </span>
                {accessible ? (
                  <ArrowRight
                    className="size-3.5 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                ) : (
                  <LockKeyhole className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <aside className="panel flex min-w-0 flex-col overflow-hidden">
        <div
          className={cn(
            "flex items-start justify-between gap-3 border-b border-line px-5 py-4",
            selectedTheme ? selectedTheme.bgSoft : "bg-surface-raised",
          )}
        >
          <div className="min-w-0">
            <p className="label-mono">{selected ? selected.code : "Campus overview"}</p>
            <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-[-0.01em] text-ink">
              {selected ? selected.shortName : "Three blocks, one plaza"}
            </h2>
          </div>
          <span
            className={cn(
              "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-sm border bg-surface",
              selectedTheme ? selectedTheme.borderSoft : "border-line",
              selectedTheme ? selectedTheme.textDeep : "text-ink-faint",
            )}
          >
            {selected ? <Box className="size-4" strokeWidth={1.8} aria-hidden /> : <Compass className="size-4" strokeWidth={1.8} aria-hidden />}
          </span>
        </div>

        <div className="flex-1 p-5">
          {selected ? (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">{selected.description}</p>

              <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">Room</dt>
                  <dd className="text-right font-medium text-ink">{selected.room}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">Experiments</dt>
                  <dd className="text-right font-medium text-ink">{experimentCounts[selected.id]} published</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">Access</dt>
                  <dd className="text-right">
                    {role !== "student" || access.includes(selected.id) ? (
                      <Badge tone="ok" dot>
                        Granted
                      </Badge>
                    ) : (
                      <Badge tone="neutral">Not granted</Badge>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {selected.focus.map((item) => (
                  <Badge key={item} tone="neutral">
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 border-t border-line pt-4">
                {role !== "student" || access.includes(selected.id) ? (
                  <Link href={`/labs/${selected.id}`} className={cn(buttonClass("primary", "sm"), "w-full")}>
                    Enter the laboratory
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                ) : (
                  <div className="rounded-sm border border-line bg-surface-raised px-3 py-2.5">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-ink">
                      <LockKeyhole className="size-3.5 text-ink-faint" aria-hidden />
                      Access not granted
                    </p>
                    <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-faint">
                      Your institution controls entry per block. Ask the registrar or your instructor.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink-soft">
                The campus groups the three teaching laboratories around a central plaza. Pick a block on
                the model, or choose one below, to inspect its provision.
              </p>
              <ul className="mt-5 space-y-3 border-t border-line pt-4">
                {CAMPUS_DESTINATIONS.map((destination) => (
                  <li key={destination.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(destination.id)}
                      className="group flex w-full items-start gap-3 rounded-sm text-left transition-colors duration-150 hover:bg-surface-raised"
                    >
                      <span
                        className={cn("mt-1 size-1.5 shrink-0 rounded-full", accentTheme(destination.accent).bg)}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.8125rem] font-medium text-ink group-hover:text-cobalt-deep">
                          {destination.shortName}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-ink-faint">
                          {destination.focus.join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {activeSessionLabId ? (
                <div className="mt-5 flex items-start gap-2.5 rounded-sm border border-cyan/25 bg-cyan-wash px-3 py-2.5">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-cyan" strokeWidth={1.9} aria-hidden />
                  <p className="text-[0.6875rem] leading-relaxed text-cyan">
                    You have an open simulated session. The block is ringed on the model.
                  </p>
                </div>
              ) : null}

              <Link href="/labs" className={cn(buttonClass("secondary", "sm"), "mt-5 w-full")}>
                Browse all laboratories
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </>
          )}
        </div>

        <div className="border-t border-line bg-surface-raised px-5 py-3">
          <p className="font-mono text-[0.5625rem] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
            Site model is representative. {role === "student" ? "Access follows your institution record." : "Staff view: all blocks visible."}
          </p>
        </div>
      </aside>
    </div>
  );
}
