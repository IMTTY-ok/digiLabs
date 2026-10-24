import type { ExperimentId } from "@/types";

export interface ObservationColumn {
  key: string;
  label: string;
  unit?: string;
  decimals?: number;
}

export const OBSERVATION_COLUMNS: Record<ExperimentId, ObservationColumn[]> = {
  c1: [
    { key: "volumeUsedMl", label: "Titre", unit: "mL", decimals: 2 },
    { key: "finalReadingMl", label: "Final reading", unit: "mL", decimals: 2 },
    { key: "initialReadingMl", label: "Initial reading", unit: "mL", decimals: 2 },
    { key: "standardMolarity", label: "Standard", unit: "M", decimals: 4 },
    { key: "flaskVolumeMl", label: "Aliquot", unit: "mL", decimals: 1 },
    { key: "estimatedMolarity", label: "Calculated", unit: "M", decimals: 4 },
  ],
  c2: [
    { key: "volumeUsedMl", label: "Titre", unit: "mL", decimals: 2 },
    { key: "finalReadingMl", label: "Final reading", unit: "mL", decimals: 2 },
    { key: "initialReadingMl", label: "Initial reading", unit: "mL", decimals: 2 },
    { key: "standardMolarity", label: "Standard", unit: "M", decimals: 4 },
    { key: "flaskVolumeMl", label: "Acid volume", unit: "mL", decimals: 1 },
    { key: "estimatedMolarity", label: "Calculated", unit: "M", decimals: 4 },
  ],
  e1: [
    { key: "sourceVoltage", label: "Vₛ", unit: "V", decimals: 2 },
    { key: "r1", label: "R1", unit: "Ω", decimals: 0 },
    { key: "r2", label: "R2", unit: "Ω", decimals: 0 },
    { key: "current", label: "Current", unit: "A", decimals: 4 },
    { key: "v1", label: "V1", unit: "V", decimals: 3 },
    { key: "v2", label: "V2", unit: "V", decimals: 3 },
    { key: "residual", label: "Residual", unit: "V", decimals: 4 },
  ],
  e2: [
    { key: "sourceVoltage", label: "Vₛ", unit: "V", decimals: 2 },
    { key: "r1", label: "R1", unit: "Ω", decimals: 0 },
    { key: "r2", label: "R2", unit: "Ω", decimals: 0 },
    { key: "i1", label: "I1", unit: "A", decimals: 4 },
    { key: "i2", label: "I2", unit: "A", decimals: 4 },
    { key: "total", label: "I total", unit: "A", decimals: 4 },
    { key: "balance", label: "Balance", unit: "A", decimals: 5 },
  ],
  i1: [
    { key: "componentsInspected", label: "Components inspected", decimals: 0 },
    { key: "explodedView", label: "Exploded view", decimals: 0 },
    { key: "labelsVisible", label: "Labels visible", decimals: 0 },
  ],
  i2: [
    { key: "hotspotsExplored", label: "Hotspots explored", decimals: 0 },
    { key: "selfTestCorrect", label: "Self-test correct", decimals: 0 },
    { key: "selfTestAttempts", label: "Self-test attempts", decimals: 0 },
  ],
};

export function formatObservationValue(value: unknown, decimals?: number): string {
  if (typeof value === "number") {
    if (decimals === undefined) return String(value);
    return value.toFixed(decimals);
  }
  if (typeof value === "string") return value;
  return "—";
}
