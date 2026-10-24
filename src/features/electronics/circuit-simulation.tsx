"use client";

import { useState, useTransition } from "react";
import {
  Activity,
  AlertTriangle,
  Save,
  Zap,
} from "lucide-react";

import { Alert, Badge, Button, Field, Input, Select, SourceBadge } from "@/components/ui";
import {
  KCL_RANGES,
  KVL_RANGES,
  computeParallel,
  computeSeries,
  validateSeries,
} from "@/features/electronics/calculations/circuits";
import { cn } from "@/lib/utils/cn";
import type {
  KclFault,
  KvlFault,
  ParallelCircuit,
  SeriesCircuit,
} from "@/features/electronics/calculations/circuits";

type Variant = "kvl" | "kcl";

export function CircuitSimulation({
  variant,
  onRecord,
  readOnly = false,
}: {
  variant: Variant;
  onRecord?: (
    values: Record<string, number | string>,
    note?: string,
  ) => Promise<{ ok: boolean; message?: string }>;
  readOnly?: boolean;
}) {
  const isKvl = variant === "kvl";
  const [sourceVoltage, setSourceVoltage] = useState(6);
  const [r1, setR1] = useState(isKvl ? 220 : 220);
  const [r2, setR2] = useState(isKvl ? 330 : 470);
  const [fault, setFault] = useState<KvlFault | KclFault>("none");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [recordMessage, setRecordMessage] = useState("");

  const seriesCircuit: SeriesCircuit = { sourceVoltage, r1, r2, fault: fault as KvlFault };
  const parallelCircuit: ParallelCircuit = { sourceVoltage, r1, r2, fault: fault as KclFault };

  const errors = validateSeries(seriesCircuit);
  const series = computeSeries(seriesCircuit);
  const parallel = computeParallel(parallelCircuit);

  const kvlFaults: { value: KvlFault; label: string }[] = [
    { value: "none", label: "None" },
    { value: "open-r2", label: "R2 open" },
    { value: "shorted-r1", label: "R1 shorted" },
  ];
  const kclFaults: { value: KclFault; label: string }[] = [
    { value: "none", label: "None" },
    { value: "open-branch-1", label: "Branch 1 open" },
    { value: "open-branch-2", label: "Branch 2 open" },
  ];

  async function record() {
    if (!onRecord || errors.length > 0) return;
    startTransition(async () => {
      const values: Record<string, number | string> = {
        sourceVoltage,
        r1,
        r2,
        fault,
      };
      if (isKvl) {
        values.current = Number(series.current.toFixed(6));
        values.v1 = Number(series.v1.toFixed(4));
        values.v2 = Number(series.v2.toFixed(4));
        values.residual = Number(series.sum.toFixed(6));
      } else {
        values.i1 = Number(parallel.i1.toFixed(6));
        values.i2 = Number(parallel.i2.toFixed(6));
        values.total = Number(parallel.total.toFixed(6));
        values.balance = Number(parallel.balance.toFixed(6));
      }
      const result = await onRecord(values, note || undefined);
      setRecordMessage(result.message ?? (result.ok ? "Observation recorded." : "Could not record."));
      if (result.ok) setNote("");
    });
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-sm border border-line bg-surface-raised p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="label-mono">Controls</p>
            <Badge tone="cyan">
              <SourceBadge source="simulation" />
            </Badge>
          </div>

          <div className="mt-3 space-y-3">
            <Field label={`Source voltage (${KVL_RANGES.sourceVoltage.min}–${KVL_RANGES.sourceVoltage.max} V)`} htmlFor="vs">
              <div className="flex items-center gap-3">
                <input
                  id="vs"
                  type="range"
                  min={KVL_RANGES.sourceVoltage.min}
                  max={KVL_RANGES.sourceVoltage.max}
                  step={KVL_RANGES.sourceVoltage.step}
                  value={sourceVoltage}
                  onChange={(event) => setSourceVoltage(Number(event.target.value))}
                  className="flex-1 accent-cobalt"
                />
                <span className="w-16 text-right font-mono tabular text-ink">
                  {sourceVoltage.toFixed(1)} V
                </span>
              </div>
            </Field>

            <Field label={`R1 (${KVL_RANGES.r1.min}–${KVL_RANGES.r1.max} Ω)`} htmlFor="r1">
              <div className="flex items-center gap-3">
                <input
                  id="r1"
                  type="range"
                  min={KVL_RANGES.r1.min}
                  max={KVL_RANGES.r1.max}
                  step={KVL_RANGES.r1.step}
                  value={r1}
                  onChange={(event) => setR1(Number(event.target.value))}
                  className="flex-1 accent-cobalt"
                />
                <span className="w-16 text-right font-mono tabular text-ink">{r1} Ω</span>
              </div>
            </Field>

            <Field label={`R2 (${KVL_RANGES.r2.min}–${KVL_RANGES.r2.max} Ω)`} htmlFor="r2">
              <div className="flex items-center gap-3">
                <input
                  id="r2"
                  type="range"
                  min={KVL_RANGES.r2.min}
                  max={KVL_RANGES.r2.max}
                  step={KVL_RANGES.r2.step}
                  value={r2}
                  onChange={(event) => setR2(Number(event.target.value))}
                  className="flex-1 accent-cobalt"
                />
                <span className="w-16 text-right font-mono tabular text-ink">{r2} Ω</span>
              </div>
            </Field>

            <Field label="Fault injection" htmlFor="fault">
              <Select
                id="fault"
                value={fault}
                onChange={(event) => setFault(event.target.value as KvlFault | KclFault)}
              >
                {(isKvl ? kvlFaults : kclFaults).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {errors.length > 0 ? (
            <div className="mt-3 space-y-1">
              {errors.map((error) => (
                <Alert key={error} tone="danger">
                  {error}
                </Alert>
              ))}
            </div>
          ) : null}
        </div>

        {/* Schematic */}
        <div className="rounded-sm border border-line bg-surface-raised p-4">
          <p className="label-mono mb-3">Schematic</p>
          <svg viewBox="0 0 320 220" className="mx-auto h-52 w-full max-w-sm" role="img" aria-label={isKvl ? "Series circuit" : "Parallel circuit"}>
            {/* Battery */}
            <g>
              <line x1="40" y1="40" x2="40" y2="180" stroke="#c9c0b1" strokeWidth="2" />
              <line x1="30" y1="95" x2="50" y2="95" stroke="#191d22" strokeWidth="2.5" />
              <line x1="34" y1="115" x2="46" y2="115" stroke="#191d22" strokeWidth="1.5" />
              <text x="18" y="92" fontFamily="monospace" fontSize="9" fill="#5a6068">+</text>
              <text x="18" y="120" fontFamily="monospace" fontSize="9" fill="#5a6068">−</text>
              <text x="12" y="150" fontFamily="monospace" fontSize="8" fill="#8b8f94" transform="rotate(-90 12 150)">
                {sourceVoltage.toFixed(1)} V
              </text>
            </g>

            {isKvl ? (
              <>
                {/* Top wire R1 */}
                <line x1="40" y1="40" x2="140" y2="40" stroke="#c9c0b1" strokeWidth="2" />
                <g>
                  <polyline
                    points="140,40 150,30 160,50 170,30 180,50 190,30 200,40"
                    fill="none"
                    stroke="#1e5bc6"
                    strokeWidth="2"
                  />
                  <text x="170" y="22" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#1e5bc6">
                    R1
                  </text>
                </g>
                <line x1="200" y1="40" x2="280" y2="40" stroke="#c9c0b1" strokeWidth="2" />
                {/* Right wire R2 */}
                <line x1="280" y1="40" x2="280" y2="90" stroke="#c9c0b1" strokeWidth="2" />
                <g>
                  <polyline
                    points="280,90 270,100 290,110 270,120 290,130 270,140 280,150"
                    fill="none"
                    stroke="#177f8c"
                    strokeWidth="2"
                  />
                  <text x="296" y="122" fontFamily="monospace" fontSize="9" fill="#177f8c">
                    R2
                  </text>
                </g>
                <line x1="280" y1="150" x2="280" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                <line x1="280" y1="180" x2="40" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                {/* Current arrow */}
                <polygon points="110,36 118,40 110,44" fill="#a9660f" />
                <text x="114" y="30" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#a9660f">
                  I
                </text>
                {fault !== "none" ? (
                  <g>
                    <circle cx="280" cy={fault === "open-r2" ? 100 : 40} r="6" fill="none" stroke="#a9352d" strokeWidth="1.5" strokeDasharray="3 2" />
                    <text x="256" y={fault === "open-r2" ? 96 : 36} fontFamily="monospace" fontSize="8" fill="#a9352d">
                      fault
                    </text>
                  </g>
                ) : null}
              </>
            ) : (
              <>
                {/* Source to node */}
                <line x1="40" y1="40" x2="120" y2="40" stroke="#c9c0b1" strokeWidth="2" />
                <line x1="120" y1="40" x2="120" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                <circle cx="120" cy="40" r="3.5" fill="#191d22" />
                {/* Branch 1 */}
                <line x1="120" y1="40" x2="170" y2="40" stroke="#c9c0b1" strokeWidth="2" />
                <polyline points="170,40 180,30 190,50 200,30 210,50 220,40" fill="none" stroke="#1e5bc6" strokeWidth="2" />
                <line x1="220" y1="40" x2="280" y2="40" stroke="#c9c0b1" strokeWidth="2" />
                <line x1="280" y1="40" x2="280" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                {/* Branch 2 */}
                <line x1="120" y1="180" x2="170" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                <polyline points="170,180 180,170 190,190 200,170 210,190 220,180" fill="none" stroke="#177f8c" strokeWidth="2" />
                <line x1="220" y1="180" x2="280" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                {/* Return */}
                <line x1="280" y1="180" x2="40" y2="180" stroke="#c9c0b1" strokeWidth="2" />
                {/* Node dot */}
                <circle cx="120" cy="110" r="0" />
                <text x="108" y="114" fontFamily="monospace" fontSize="9" fill="#191d22">
                  node
                </text>
                <text x="195" y="30" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#1e5bc6">
                  R1
                </text>
                <text x="195" y="200" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#177f8c">
                  R2
                </text>
                {fault !== "none" ? (
                  <g>
                    <circle
                      cx={fault === "open-branch-1" ? 195 : 195}
                      cy={fault === "open-branch-1" ? 40 : 180}
                      r="6"
                      fill="none"
                      stroke="#a9352d"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                  </g>
                ) : null}
              </>
            )}
          </svg>

          {isKvl && series.note ? (
            <Alert tone="warning" className="mt-3">
              {series.note}
            </Alert>
          ) : null}
          {!isKvl && parallel.note ? (
            <Alert tone="warning" className="mt-3">
              {parallel.note}
            </Alert>
          ) : null}
        </div>
      </div>

      {/* Readings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-line bg-surface p-5">
          <p className="label-mono mb-3">{isKvl ? "KVL readings" : "KCL readings"}</p>
          {isKvl ? (
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Current I</dt>
                <dd className="font-mono tabular text-ink">{(series.current * 1000).toFixed(2)} mA</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">V1 (R1)</dt>
                <dd className="font-mono tabular text-ink">{series.v1.toFixed(3)} V</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">V2 (R2)</dt>
                <dd className="font-mono tabular text-ink">{series.v2.toFixed(3)} V</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Total resistance</dt>
                <dd className="font-mono tabular text-ink">
                  {Number.isFinite(series.totalResistance) ? `${Math.round(series.totalResistance)} Ω` : "∞"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">V1 + V2</dt>
                <dd className="font-mono tabular text-ink">{(series.v1 + series.v2).toFixed(3)} V</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Residual Vₛ − V1 − V2</dt>
                <dd className="font-mono tabular text-ink">{series.sum.toFixed(6)} V</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Power</dt>
                <dd className="font-mono tabular text-ink">{series.power.toFixed(3)} W</dd>
              </div>
            </dl>
          ) : (
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">I1 (R1)</dt>
                <dd className="font-mono tabular text-ink">{(parallel.i1 * 1000).toFixed(2)} mA</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">I2 (R2)</dt>
                <dd className="font-mono tabular text-ink">{(parallel.i2 * 1000).toFixed(2)} mA</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">I total</dt>
                <dd className="font-mono tabular text-ink">{(parallel.total * 1000).toFixed(2)} mA</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">I1 + I2</dt>
                <dd className="font-mono tabular text-ink">
                  {((parallel.i1 + parallel.i2) * 1000).toFixed(2)} mA
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Balance</dt>
                <dd className="font-mono tabular text-ink">{parallel.balance.toFixed(6)} A</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Equivalent R</dt>
                <dd className="font-mono tabular text-ink">{Math.round(parallel.equivalentResistance)} Ω</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-soft">Power</dt>
                <dd className="font-mono tabular text-ink">{parallel.totalPower.toFixed(3)} W</dd>
              </div>
            </dl>
          )}
        </div>

        {!readOnly && onRecord ? (
          <div className="rounded-sm border border-line bg-surface p-5">
            <p className="label-mono mb-2">Record observation</p>
            <p className="text-xs leading-relaxed text-ink-soft">
              Record the readings you intend to use in your report. The simulation section is marked
              complete on recording.
            </p>
            <Field label="Note (optional)" htmlFor="circuit-note" className="mt-3">
              <Input
                id="circuit-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={isKvl ? "KVL verified within meter resolution." : "KCL verified at the junction."}
              />
            </Field>
            <Button
              variant="primary"
              size="sm"
              full
              className="mt-3"
              disabled={pending || errors.length > 0}
              onClick={record}
            >
              <Save className="size-3.5" aria-hidden />
              {pending ? "Recording…" : "Record reading"}
            </Button>
            {recordMessage ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{recordMessage}</p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-sm border border-line bg-surface p-5">
            <p className="text-xs leading-relaxed text-ink-soft">
              Staff preview: interactive work and recording are completed by students.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-sm border border-amber/20 bg-amber-wash px-3 py-2.5">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber" strokeWidth={1.8} aria-hidden />
        <p className="text-[0.6875rem] leading-relaxed text-amber">
          {isKvl
            ? "A residual of zero is expected for ideal components. Real meters and resistor tolerance produce a small non-zero value, which should be reported honestly."
            : "The balance should be zero within floating-point arithmetic. In practice, meter resolution creates a small residual."}
        </p>
      </div>
    </div>
  );
}
