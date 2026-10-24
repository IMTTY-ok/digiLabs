/**
 * Pure DC circuit model used by both Kirchhoff experiments.
 * All voltages are volts, resistances ohms, currents amperes.
 */

export type KvlFault = "none" | "open-r2" | "shorted-r1";
export type KclFault = "none" | "open-branch-1" | "open-branch-2";

export interface SeriesCircuit {
  sourceVoltage: number;
  r1: number;
  r2: number;
  fault: KvlFault;
}

export interface SeriesResult {
  current: number;
  v1: number;
  v2: number;
  totalResistance: number;
  sum: number;
  power: number;
  note: string | null;
}

export interface ParallelCircuit {
  sourceVoltage: number;
  r1: number;
  r2: number;
  fault: KclFault;
}

export interface ParallelResult {
  i1: number;
  i2: number;
  total: number;
  balance: number;
  equivalentResistance: number;
  totalPower: number;
  note: string | null;
}

export const KVL_RANGES = {
  sourceVoltage: { min: 1, max: 12, step: 0.5, unit: "V" },
  r1: { min: 47, max: 1000, step: 10, unit: "Ω" },
  r2: { min: 47, max: 1000, step: 10, unit: "Ω" },
} as const;

export const KCL_RANGES = KVL_RANGES;

export function computeSeries(circuit: SeriesCircuit): SeriesResult {
  const { sourceVoltage: vs, r1, r2, fault } = circuit;

  if (fault === "open-r2") {
    return {
      current: 0,
      v1: 0,
      v2: vs,
      totalResistance: Number.POSITIVE_INFINITY,
      sum: vs - 0 - vs,
      power: 0,
      note: "R2 is open. No current flows, so V1 = 0 V. An ideal voltmeter across the break reads the full source voltage.",
    };
  }

  if (fault === "shorted-r1") {
    const current = vs / r2;
    return {
      current,
      v1: 0,
      v2: vs,
      totalResistance: r2,
      sum: vs - 0 - vs,
      power: vs * current,
      note: "R1 is shorted. The whole source voltage appears across R2 and current is limited only by R2. Remove the fault before recording a fair trial.",
    };
  }

  const totalResistance = r1 + r2;
  const current = vs / totalResistance;
  const v1 = current * r1;
  const v2 = current * r2;
  return {
    current,
    v1,
    v2,
    totalResistance,
    sum: vs - v1 - v2,
    power: vs * current,
    note: null,
  };
}

export function computeParallel(circuit: ParallelCircuit): ParallelResult {
  const { sourceVoltage: vs, r1, r2, fault } = circuit;

  if (fault === "open-branch-1" || fault === "open-branch-2") {
    const branchOpen = fault === "open-branch-1" ? 1 : 2;
    const openR = branchOpen === 1 ? r1 : r2;
    const liveR = branchOpen === 1 ? r2 : r1;
    const liveCurrent = vs / liveR;
    return {
      i1: branchOpen === 1 ? 0 : vs / r1,
      i2: branchOpen === 2 ? 0 : vs / r2,
      total: liveCurrent,
      balance: liveCurrent - (branchOpen === 1 ? 0 : vs / r1) - (branchOpen === 2 ? 0 : vs / r2),
      equivalentResistance: openR > 0 ? liveR : 0,
      totalPower: vs * liveCurrent,
      note: `Branch ${branchOpen} is open. That branch carries 0 A; the source feeds only the remaining branch. The junction still balances.`,
    };
  }

  const i1 = vs / r1;
  const i2 = vs / r2;
  const total = i1 + i2;
  const equivalentResistance = 1 / (1 / r1 + 1 / r2);
  return {
    i1,
    i2,
    total,
    balance: total - i1 - i2,
    equivalentResistance,
    totalPower: vs * total,
    note: null,
  };
}

export function validateSeries(circuit: SeriesCircuit): string[] {
  const errors: string[] = [];
  const check = (value: number, range: { min: number; max: number }, label: string) => {
    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      errors.push(`${label} must be between ${range.min} and ${range.max}.`);
    }
  };
  check(circuit.sourceVoltage, KVL_RANGES.sourceVoltage, "Source voltage");
  check(circuit.r1, KVL_RANGES.r1, "R1");
  check(circuit.r2, KVL_RANGES.r2, "R2");
  return errors;
}

export function formatCurrent(value: number): string {
  return value >= 1 ? `${value.toFixed(3)} A` : `${(value * 1000).toFixed(2)} mA`;
}

export function formatVoltage(value: number): string {
  return `${value.toFixed(3)} V`;
}

export function formatOhms(value: number): string {
  return `${Math.round(value)} Ω`;
}
