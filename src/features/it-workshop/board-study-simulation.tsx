"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { Check, Eye, EyeOff, Save, Shuffle, Target } from "lucide-react";

import { Alert, Badge, Button, Panel, SourceBadge } from "@/components/ui";
import { BOARD_HOTSPOTS, type BoardHotspot } from "@/features/it-workshop/content";
import { useWebGLSupport } from "@/components/three/use-webgl";
import { cn } from "@/lib/utils/cn";

const BoardScene = dynamic(() => import("./board-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0c1626]">
      <div className="text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
        <p className="mt-3 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-white/40">
          Building the board
        </p>
      </div>
    </div>
  ),
});

function randomHotspot(): BoardHotspot {
  return BOARD_HOTSPOTS[Math.floor(Math.random() * BOARD_HOTSPOTS.length)];
}

export function BoardStudySimulation({
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
  const [selectedId, setSelectedId] = useState<string | null>(BOARD_HOTSPOTS[0].id);
  const [explored, setExplored] = useState<Set<string>>(new Set([BOARD_HOTSPOTS[0].id]));
  const [showLabels, setShowLabels] = useState(true);
  const [selfTest, setSelfTest] = useState(false);
  const [targetId, setTargetId] = useState<string>(BOARD_HOTSPOTS[1].id);
  const [selfCorrect, setSelfCorrect] = useState(0);
  const [selfAttempts, setSelfAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [recordMessage, setRecordMessage] = useState("");

  const selected = selectedId ? BOARD_HOTSPOTS.find((hotspot) => hotspot.id === selectedId) : null;
  const target = BOARD_HOTSPOTS.find((hotspot) => hotspot.id === targetId);

  function select(id: string) {
    if (selfTest) {
      setSelfAttempts((value) => value + 1);
      if (id === targetId) {
        setSelfCorrect((value) => value + 1);
        setFeedback("Correct. A new target has been chosen.");
        const next = randomHotspot();
        setTargetId(next.id);
      } else {
        setFeedback("Not quite — try again. Labels stay hidden.");
      }
      return;
    }
    setSelectedId(id);
    setExplored((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
    setFeedback("");
  }

  function startSelfTest() {
    setSelfTest(true);
    setShowLabels(false);
    setTargetId(randomHotspot().id);
    setFeedback("Labels hidden. Find the highlighted component.");
  }

  function stopSelfTest() {
    setSelfTest(false);
    setShowLabels(true);
    setFeedback("");
  }

  async function record() {
    if (!onRecord || explored.size < 6) return;
    startTransition(async () => {
      const result = await onRecord(
        {
          hotspotsExplored: explored.size,
          selfTestCorrect: selfCorrect,
          selfTestAttempts: selfAttempts,
        },
        note || undefined,
      );
      setRecordMessage(result.message ?? (result.ok ? "Observation recorded." : "Could not record."));
      if (result.ok) setNote("");
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="cyan">
          <SourceBadge source="simulation" />
        </Badge>
        <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
          {explored.size} of {BOARD_HOTSPOTS.length} hotspots explored
        </span>
        {selfTest ? (
          <Badge tone="amber" dot>
            Self-test · {selfCorrect}/{selfAttempts}
          </Badge>
        ) : null}
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
              <BoardScene
                selectedId={selectedId}
                hideLabels={!showLabels || selfTest}
                onSelect={select}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <p className="max-w-sm text-center text-xs leading-relaxed text-white/55">
                  Select a component from the list to read its function and interactions.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={showLabels ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowLabels((value) => !value)}
              disabled={selfTest}
            >
              {showLabels ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
              {showLabels ? "Labels on" : "Labels off"}
            </Button>
            {!selfTest ? (
              <Button variant="secondary" size="sm" onClick={startSelfTest}>
                <Shuffle className="size-3.5" aria-hidden />
                Self-test mode
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={stopSelfTest}>
                <Eye className="size-3.5" aria-hidden />
                Exit self-test
              </Button>
            )}
            <span className="self-center font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
              Drag to orbit · scroll to zoom
            </span>
          </div>

          {selfTest && target ? (
            <div className="rounded-sm border border-amber/30 bg-amber-wash px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-amber">
                <Target className="size-4" aria-hidden />
                Find: {target.name}
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-soft">
                {target.location}. {feedback || "Click the matching hotspot on the board."}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <p className="label-mono">Hotspot list</p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                {selfTest ? "Click to answer" : "Select a component"}
              </h3>
            </div>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto">
              {BOARD_HOTSPOTS.map((hotspot) => {
                const done = explored.has(hotspot.id);
                const active = selectedId === hotspot.id;
                return (
                  <li key={hotspot.id}>
                    <button
                      type="button"
                      onClick={() => select(hotspot.id)}
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
                          {hotspot.name}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                          {hotspot.location}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {selected && !selfTest ? (
            <Panel className="p-5">
              <p className="label-mono">{selected.location}</p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">
                {selected.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{selected.description}</p>
              <div className="mt-3 space-y-2 border-t border-line pt-3 text-xs">
                <p>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    Function ·{" "}
                  </span>
                  <span className="text-ink-soft">{selected.function}</span>
                </p>
                <p>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-faint">
                    Interacts with ·{" "}
                  </span>
                  <span className="text-ink-soft">{selected.interacts}</span>
                </p>
              </div>
            </Panel>
          ) : null}

          {!readOnly && onRecord ? (
            <Panel className="p-5">
              <p className="label-mono mb-2">Record observation</p>
              <p className="text-xs leading-relaxed text-ink-soft">
                Explore at least six hotspots, then record. The simulation section is marked complete.
              </p>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Hotspots identified and self-test completed."
                className="mt-3 h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink focus:border-cobalt focus:outline-none"
              />
              <Button
                variant="primary"
                size="sm"
                full
                className="mt-3"
                disabled={pending || explored.size < 6}
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
