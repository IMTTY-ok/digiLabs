"use client";

import { useState, useTransition } from "react";
import {
  Beaker,
  Droplets,
  FlaskConical,
  RotateCcw,
  Save,
} from "lucide-react";

import { Alert, Badge, Button, Field, Input, Panel, SourceBadge } from "@/components/ui";
import {
  PHENOLPHTHALEIN,
  clampDelivered,
  readTitration,
  validateTitrationSetup,
  formatVolume,
  formatMolarity,
  approximatePh,
  DEFAULT_SETUPS,
} from "@/features/chemistry/calculations/titration";
import { cn } from "@/lib/utils/cn";
import type { TitrationSetup, TitrationVariant } from "@/features/chemistry/calculations/titration";

export function TitrationSimulation({
  variant,
  onRecord,
  readOnly = false,
}: {
  variant: TitrationVariant;
  onRecord?: (
    values: Record<string, number | string>,
    note?: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  readOnly?: boolean;
}) {
  const [setup, setSetup] = useState<TitrationSetup>(() => DEFAULT_SETUPS[variant]);
  const [delivered, setDelivered] = useState(0);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [recordMessage, setRecordMessage] = useState("");

  const errors = validateTitrationSetup(setup);
  const reading = readTitration(setup, delivered, true);
  const ph = approximatePh(setup, delivered);

  const flaskColor = reading.hasEndpoint
    ? reading.pinkIntensity > 0.6
      ? PHENOLPHTHALEIN.strong
      : PHENOLPHTHALEIN.pink
    : reading.isApproaching
      ? PHENOLPHTHALEIN.faint
      : PHENOLPHTHALEIN.colorless;

  function addVolume(amount: number) {
    setDelivered((current) => clampDelivered(setup, current + amount));
  }

  function reset() {
    setDelivered(0);
  }

  function updateSetup(patch: Partial<TitrationSetup>) {
    setSetup((current) => ({ ...current, ...patch }));
    setDelivered(0);
  }

  async function record() {
    if (!onRecord || errors.length > 0 || !reading.hasEndpoint) return;
    startTransition(async () => {
      const result = await onRecord(
        {
          standardMolarity: setup.standardMolarity,
          flaskVolumeMl: setup.flaskVolumeMl,
          initialReadingMl: setup.initialReadingMl,
          volumeUsedMl: Number(reading.deliveredMl.toFixed(2)),
          finalReadingMl: Number(reading.finalReadingMl.toFixed(2)),
          estimatedMolarity: Number(reading.estimatedMolarity.toFixed(4)),
          actualMolarity: Number(setup.unknownMolarity.toFixed(4)),
          errorPct: Number(reading.errorPct.toFixed(2)),
        },
        note || undefined,
      );
      setRecordMessage(result.message ?? (result.ok ? "Observation recorded." : "Could not record."));
      if (result.ok) setNote("");
    });
  }

  const buretteTotal = setup.capacityMl;
  const levelPct = (reading.finalReadingMl / buretteTotal) * 100;
  const liquidHeightPct = 100 - levelPct;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        {/* Apparatus */}
        <div className="rounded-sm border border-line bg-surface-raised p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="label-mono">Apparatus</p>
            <Badge tone="cyan">
              <SourceBadge source="simulation" />
            </Badge>
          </div>

          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
            {/* Burette */}
            <div className="relative h-64 w-20 shrink-0">
              <div className="absolute inset-x-6 top-0 h-64 rounded-sm border border-line-strong bg-surface">
                <div
                  className="absolute inset-x-0 bottom-0 bg-cyan/35 transition-[height] duration-300"
                  style={{ height: `${liquidHeightPct}%` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-x-0 h-px bg-cyan transition-[top] duration-300"
                  style={{ top: `${levelPct}%` }}
                  aria-hidden
                />
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((mark) => (
                  <div
                    key={mark}
                    className="absolute right-0 flex items-center gap-1"
                    style={{ top: `${(mark / buretteTotal) * 100}%` }}
                  >
                    <span className="h-px w-2 bg-line-strong" aria-hidden />
                    {mark % 10 === 0 ? (
                      <span className="font-mono text-[0.5rem] tabular text-ink-faint">{mark}</span>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-1 left-1/2 h-3 w-8 -translate-x-1/2 rounded-sm border border-line-strong bg-surface" aria-hidden />
              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ink-faint">
                Burette
              </p>
            </div>

            {/* Flask */}
            <div className="relative flex h-64 w-40 items-end justify-center">
              <svg viewBox="0 0 160 180" className="h-56 w-40" role="img" aria-label="Conical flask">
                <path
                  d="M58 18 L58 62 L22 148 Q20 162 40 170 L120 170 Q140 162 138 148 L102 62 L102 18 Z"
                  fill="none"
                  stroke="#c9c0b1"
                  strokeWidth="2"
                />
                <ellipse cx="80" cy="138" rx="46" ry="24" fill={flaskColor} opacity="0.85" />
                <ellipse cx="80" cy="138" rx="46" ry="24" fill="none" stroke={flaskColor} opacity="0.4" />
                <rect x="58" y="14" width="44" height="8" rx="2" fill="#c9c0b1" opacity="0.5" />
              </svg>
              <p className="absolute bottom-0 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-ink-faint">
                {variant === "c1" ? "HCl in flask" : "Oxalic acid in flask"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Standard molarity" htmlFor="std-m">
              <Input
                id="std-m"
                type="number"
                min={0.005}
                max={1}
                step={0.005}
                value={setup.standardMolarity}
                onChange={(event) =>
                  updateSetup({ standardMolarity: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Flask volume (mL)" htmlFor="flask-v">
              <Input
                id="flask-v"
                type="number"
                min={10}
                max={50}
                step={1}
                value={setup.flaskVolumeMl}
                onChange={(event) =>
                  updateSetup({ flaskVolumeMl: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Initial reading (mL)" htmlFor="init-r">
              <Input
                id="init-r"
                type="number"
                min={0}
                max={2}
                step={0.05}
                value={setup.initialReadingMl}
                onChange={(event) =>
                  updateSetup({ initialReadingMl: Number(event.target.value) })
                }
              />
            </Field>
            <div className="flex items-end">
              <Button variant="secondary" size="md" full onClick={reset}>
                <RotateCcw className="size-3.5" aria-hidden />
                Reset titre
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => addVolume(5)}>
              +5.00 mL
            </Button>
            <Button variant="secondary" size="sm" onClick={() => addVolume(1)}>
              +1.00 mL
            </Button>
            <Button variant="secondary" size="sm" onClick={() => addVolume(0.1)}>
              +0.10 mL
            </Button>
            <Button variant="primary" size="sm" onClick={() => addVolume(0.05)}>
              <Droplets className="size-3.5" aria-hidden />
              Add one drop (0.05 mL)
            </Button>
          </div>

          {errors.length > 0 ? (
            <div className="mt-4 space-y-1">
              {errors.map((error) => (
                <Alert key={error} tone="danger">
                  {error}
                </Alert>
              ))}
            </div>
          ) : null}
        </div>

        {/* Readings */}
        <div className="space-y-4">
          <Panel className="p-5">
            <p className="label-mono mb-3">Readings</p>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Delivered</dt>
                <dd className="font-mono tabular text-ink">{formatVolume(reading.deliveredMl)} mL</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Final reading</dt>
                <dd className="font-mono tabular text-ink">{formatVolume(reading.finalReadingMl)} mL</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Remaining</dt>
                <dd className="font-mono tabular text-ink">{formatVolume(reading.remainingMl)} mL</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Endpoint</dt>
                <dd>
                  {reading.hasEndpoint ? (
                    <Badge tone="ok" dot>
                      Reached
                    </Badge>
                  ) : reading.isApproaching ? (
                    <Badge tone="amber" dot>
                      Approaching
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Not yet</Badge>
                  )}
                </dd>
              </div>
              {reading.hasEndpoint ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-soft">Calculated M</dt>
                    <dd className="font-mono tabular text-ink">
                      {formatMolarity(reading.estimatedMolarity)} M
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-soft">True M (simulation)</dt>
                    <dd className="font-mono tabular text-ink-faint">
                      {formatMolarity(setup.unknownMolarity)} M
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-ink-soft">Error</dt>
                    <dd className="font-mono tabular text-ink-faint">
                      {reading.errorPct.toFixed(2)} %
                    </dd>
                  </div>
                </>
              ) : null}
              {ph !== null ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-soft">Approx. pH</dt>
                  <dd className="font-mono tabular text-ink">{ph.toFixed(2)}</dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          {!readOnly && onRecord ? (
            <Panel className="p-5">
              <p className="label-mono mb-2">Record observation</p>
              <p className="text-xs leading-relaxed text-ink-soft">
                Record once the endpoint is reached. The reading is saved against your student record and
                marks the simulation section complete.
              </p>
              <Field label="Note (optional)" htmlFor="titration-note" className="mt-3">
                <Input
                  id="titration-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Persistent faint pink endpoint recorded."
                />
              </Field>
              <Button
                variant="primary"
                size="sm"
                full
                className="mt-3"
                disabled={pending || errors.length > 0 || !reading.hasEndpoint}
                onClick={record}
              >
                <Save className="size-3.5" aria-hidden />
                {pending ? "Recording…" : "Record reading"}
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
