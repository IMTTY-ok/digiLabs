import type { ProgressStep } from "@/types";

export interface StepDefinition {
  id: ProgressStep;
  label: string;
  short: string;
  description: string;
}

export const PROGRESS_STEPS: readonly StepDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    short: "Aim & apparatus",
    description: "The aim, what you need, and what you will submit.",
  },
  {
    id: "theory",
    label: "Theory",
    short: "Principles",
    description: "The chemistry or circuit law behind the experiment.",
  },
  {
    id: "procedure",
    label: "Procedure",
    short: "Method & safety",
    description: "The method, precautions and safety rules.",
  },
  {
    id: "simulation",
    label: "Simulation",
    short: "Run & record",
    description: "Run the apparatus in the browser and record readings.",
  },
  {
    id: "assessment",
    label: "Assessment",
    short: "Check understanding",
    description: "A short assessment marked on the server.",
  },
] as const;

export const PROGRESS_STEP_IDS = PROGRESS_STEPS.map((step) => step.id);

/** Steps a student can explicitly mark as read. Others are earned by doing the work. */
export const READABLE_STEP_IDS: ProgressStep[] = ["overview", "theory", "procedure"];

export function nextStep(current: ProgressStep): ProgressStep | null {
  const index = PROGRESS_STEP_IDS.indexOf(current);
  return index >= 0 ? (PROGRESS_STEP_IDS[index + 1] ?? null) : null;
}
