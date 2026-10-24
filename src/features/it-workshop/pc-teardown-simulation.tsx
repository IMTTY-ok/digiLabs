"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { Box, Check, Eye, EyeOff, Layers, Save, Sparkles } from "lucide-react";

import { Alert, Badge, Button, Panel, SourceBadge } from "@/components/ui";
import { PC_COMPONENTS, PC_COMPONENT_BY_ID } from "@/features/it-workshop/content";
import { useWebGLSupport } from "@/components/three/use-webgl";
import { cn } from "@/lib/utils/cn";

const PcScene = dynamic(() => import("./pc-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0c1626]">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
        <p className="mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/40">
          Building the model
        </p>
      </div>
    </div>
  ),
});

export function PcTeardownSimulation({
  onRecord,
  readOnly = false,
}: {
  onRecord?: (
    values: Record<string, number | string>,
    note?: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  readOnly?: boolean;
}) {
  const supported = useWebGLSupport();
  const [selectedId, setSelectedId] = useState<string | null>("cpu");
  const [exploded, setExploded] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [inspected, setInspected] = useState<Set<string>>(new Set(["cpu"]));
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [recordMessage, setRecordMessage] = useState("");

  function select(id: string) {
    setSelectedId(id);
    setInspected((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }

  async function record() {
    if (!onRecord || inspected.size < 4) return;
    startTransition(async () => {
      const result = await onRecord(
        {
          componentsInspected: inspected.size,
          explodedView: exploded ? 1 : 0,
          labelsVisible: showLabels ? 1 : 0,
        },
        note || undefined,
      );
      setRecordMessage(result.message ?? (result.ok ? "Observation recorded." : "Could not record."));
      if (result.ok) setNote("");
    });
  }

  const selected = selectedId ? PC_COMPONENT_BY_ID[selectedId] : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="cyan">
          <SourceBadge source="simulation" />
        </Badge>
        <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
          {inspected.size} of {PC_COMPONENTS.length} components inspected
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          {supported === false ? (
            <div className="rounded-sm border border-amber/30 bg-amber-wash px-4 py-3 text-sm text-amber">
              3D is not available in this browser. Use the component list to inspect each part.
            </div>
          ) : null}

          <div className="relative aspect-[4/3] min-h-[20rem] overflow-hidden rounded-sm border border-line bg-[#0c1626]">
            {supported !== false ? (
              <PcScene
                exploded={exploded}
                selectedId={selectedId}
                showLabels={showLabels}
                onSelect={select}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="max-w-sm text-center text-xs leading-relaxed text-white/55">
                  Select a component from the list to read its function and handling note.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={exploded ? "primary" : "secondary"}
              size="sm"
              onClick={() => setExploded((value) => !value)}
            >
              <Layers className="size-3.5" aria-hidden />
              {exploded ? "Assembled view" : "Exploded view"}
            </Button>
            <Button
              variant={showLabels ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowLabels((value) => !value)}
            >
              {showLabels ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
              {showLabels ? "Labels on" : "Labels off"}
            </Button>
            <span className="self-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              Drag to orbit · scroll to zoom
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <p className="label-mono">Component list</p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                Select a part
              </h3>
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {PC_COMPONENTS.map((component) => {
                const done = inspected.has(component.id);
                const active = selectedId === component.id;
                return (
                  <li key={component.id}>
                    <button
                      type="button"
                      onClick={() => select(component.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150",
                        active ? "bg-surface-raised" : "hover:bg-surface-raised",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.5rem]",
                          done
                            ? "border-ok bg-ok text-white"
                            : "border-line-strong bg-surface text-ink-faint",
                        )}
                        aria-hidden
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.8125rem] font-medium text-ink">
                          {component.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                          {component.category}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {selected ? (
            <Panel className="p-5">
              <p className="label-mono">{selected.category}</p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                {selected.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{selected.short}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{selected.description}</p>
              <div className="mt-3 space-y-2 border-t border-line pt-3 text-xs">
                <p>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    Role ·{" "}
                  </span>
                  <span className="text-ink-soft">{selected.role}</span>
                </p>
                <p>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    Handling ·{" "}
                  </span>
                  <span className="text-ink-soft">{selected.handling}</span>
                </p>
              </div>
            </Panel>
          ) : null}

          {!readOnly && onRecord ? (
            <Panel className="p-5">
              <p className="label-mono mb-2">Record observation</p>
              <p className="text-xs leading-relaxed text-ink-soft">
                Inspect at least four components, then record. The simulation section is marked complete.
              </p>
              <FieldLike className="mt-3">
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Components identified in assembled and exploded views."
                  className="h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink focus:border-cobalt focus:outline-none"
                />
              </FieldLike>
              <Button
                variant="primary"
                size="sm"
                full
                className="mt-3"
                disabled={pending || inspected.size < 4}
                onClick={record}
              >
                <Save className="size-3.5" aria-hidden />
                {pending ? "Recording…" : "Record inspection"}
              </Button>
              {recordMessage ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{recordMessage}</p>
              ) : null}
            </Panel>
          ) : (
            <Panel className="p-5">
              <p className="text-xs leading-relaxed text-ink-soft">
                Staff preview: interactive work and recording are completed by students.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLike({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
