/**
 * Pure titration model. No React, no Three.js — so the numbers can be checked
 * independently of the interface.
 */

export type TitrationVariant = "c1" | "c2";

export interface TitrationSetup {
  variant: TitrationVariant;
  /** Molarity of the standard solution (NaOH for C1, oxalic acid for C2). */
  standardMolarity: number;
  /** Volume pipetted into the conical flask, in mL. */
  flaskVolumeMl: number;
  /** Hidden assigned concentration of the unknown sample, in mol/L. */
  unknownMolarity: number;
  /** Burette capacity in mL. */
  capacityMl: number;
  /** Initial burette reading in mL (meniscus at the start). */
  initialReadingMl: number;
}

export interface TitrationReading {
  /** Volume delivered from the burette, mL. */
  deliveredMl: number;
  finalReadingMl: number;
  remainingMl: number;
  /** Volume required to reach the equivalence point, mL. */
  equivalenceMl: number;
  /** First persistent phenolphthalein pink (equivalence + one drop). */
  endpointThresholdMl: number;
  progressPct: number;
  hasEndpoint: boolean;
  isApproaching: boolean;
  pinkIntensity: number;
  estimatedMolarity: number;
  actualMolarity: number;
  errorPct: number;
}

export const PHENOLPHTHALEIN = {
  colorless: "#dbe7e4",
  faint: "#f2cdd8",
  pink: "#e08aa3",
  strong: "#c9506f",
} as const;

export const DEFAULT_SETUPS: Record<TitrationVariant, TitrationSetup> = {
  c1: {
    variant: "c1",
    standardMolarity: 0.1,
    flaskVolumeMl: 25,
    unknownMolarity: 0.1024,
    capacityMl: 50,
    initialReadingMl: 0.0,
  },
  c2: {
    variant: "c2",
    standardMolarity: 0.05,
    flaskVolumeMl: 20,
    unknownMolarity: 0.104,
    capacityMl: 50,
    initialReadingMl: 0.0,
  },
};

/** Volume of titrant needed at the stoichiometric equivalence point, in mL. */
export function equivalenceVolumeMl(setup: TitrationSetup): number {
  const { standardMolarity, flaskVolumeMl, unknownMolarity } = setup;
  if (standardMolarity <= 0 || flaskVolumeMl <= 0 || unknownMolarity <= 0) return 0;
  if (setup.variant === "c1") {
    // NaOH (burette) + HCl (flask), 1:1
    return (unknownMolarity * flaskVolumeMl) / standardMolarity;
  }
  // Oxalic acid (flask) + 2 NaOH (burette)
  return (2 * standardMolarity * flaskVolumeMl) / unknownMolarity;
}

/** Burette formula for the unknown, using the student's endpoint volume. */
export function estimateUnknownMolarity(
  setup: TitrationSetup,
  endpointVolumeMl: number,
): number {
  if (endpointVolumeMl <= 0) return 0;
  if (setup.variant === "c1") {
    return (setup.standardMolarity * endpointVolumeMl) / setup.flaskVolumeMl;
  }
  return (2 * setup.standardMolarity * setup.flaskVolumeMl) / endpointVolumeMl;
}

export function clampDelivered(setup: TitrationSetup, deliveredMl: number): number {
  return Math.min(Math.max(deliveredMl, 0), setup.capacityMl - setup.initialReadingMl);
}

export function readTitration(
  setup: TitrationSetup,
  rawDeliveredMl: number,
  revealed = false,
): TitrationReading {
  const deliveredMl = clampDelivered(setup, rawDeliveredMl);
  const equivalenceMl = equivalenceVolumeMl(setup);
  const endpointThresholdMl = equivalenceMl + 0.05;
  const hasEndpoint = deliveredMl >= endpointThresholdMl;
  const isApproaching =
    !hasEndpoint && deliveredMl >= Math.max(0, equivalenceMl - 1.0) && equivalenceMl > 0;
  const pinkIntensity = hasEndpoint
    ? Math.min(1, 0.25 + (deliveredMl - endpointThresholdMl) / 1.2)
    : isApproaching
      ? 0.08 * Math.max(0, (deliveredMl - (equivalenceMl - 1)) / 1)
      : 0;
  const estimatedMolarity = estimateUnknownMolarity(setup, deliveredMl);
  const errorPct =
    setup.unknownMolarity > 0
      ? ((estimatedMolarity - setup.unknownMolarity) / setup.unknownMolarity) * 100
      : 0;

  return {
    deliveredMl,
    finalReadingMl: setup.initialReadingMl + deliveredMl,
    remainingMl: setup.capacityMl - setup.initialReadingMl - deliveredMl,
    equivalenceMl,
    endpointThresholdMl,
    progressPct: equivalenceMl > 0 ? Math.min(100, (deliveredMl / equivalenceMl) * 100) : 0,
    hasEndpoint,
    isApproaching,
    pinkIntensity,
    estimatedMolarity: revealed || hasEndpoint ? estimatedMolarity : estimatedMolarity,
    actualMolarity: setup.unknownMolarity,
    errorPct,
  };
}

/** Simple, explicitly approximate pH for the strong-acid/strong-base case (C1 only). */
export function approximatePh(setup: TitrationSetup, deliveredMl: number): number | null {
  if (setup.variant !== "c1") return null;
  const equivalence = equivalenceVolumeMl(setup);
  const acidMoles = setup.unknownMolarity * (setup.flaskVolumeMl / 1000);
  const baseMoles = setup.standardMolarity * (deliveredMl / 1000);
  const totalL = (setup.flaskVolumeMl + deliveredMl) / 1000;
  if (totalL <= 0) return null;
  const excess = baseMoles - acidMoles;
  const tolerance = 1e-9;
  if (Math.abs(excess) < tolerance || (equivalence > 0 && Math.abs(deliveredMl - equivalence) < 0.02)) {
    return 7;
  }
  if (excess < 0) {
    const h = -excess / totalL;
    return clampPh(-Math.log10(h));
  }
  const oh = excess / totalL;
  const poh = -Math.log10(oh);
  return clampPh(14 - poh);
}

function clampPh(value: number): number {
  return Math.min(14, Math.max(0, Math.round(value * 100) / 100));
}

export function validateTitrationSetup(setup: TitrationSetup): string[] {
  const errors: string[] = [];
  if (!(setup.standardMolarity >= 0.005 && setup.standardMolarity <= 1)) {
    errors.push("Standard molarity must be between 0.005 M and 1.000 M.");
  }
  if (!(setup.flaskVolumeMl >= 10 && setup.flaskVolumeMl <= 50)) {
    errors.push("Flask volume must be between 10 mL and 50 mL.");
  }
  if (!(setup.initialReadingMl >= 0 && setup.initialReadingMl <= 2)) {
    errors.push("Initial burette reading should be between 0.00 mL and 2.00 mL.");
  }
  if (equivalenceVolumeMl(setup) > setup.capacityMl - setup.initialReadingMl) {
    errors.push("The expected titre exceeds the burette capacity. Adjust the inputs.");
  }
  return errors;
}

export function formatVolume(value: number): string {
  return value.toFixed(2);
}

export function formatMolarity(value: number): string {
  return value.toFixed(4);
}
