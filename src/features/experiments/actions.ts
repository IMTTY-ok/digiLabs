"use server";

import { revalidatePath } from "next/cache";

import { getExperimentContent, toPublicQuiz } from "@/features/experiments/registry";
import { PROGRESS_STEP_IDS } from "@/features/experiments/steps";
import { requireStudent } from "@/lib/auth/session";
import { LAB_BY_ID } from "@/lib/data/labs";
import {
  canAccessLab,
  getExperiment,
  mutateDb,
} from "@/lib/data/repository";
import { uid } from "@/lib/utils/cn";
import type {
  ActionResult,
  DemoDatabase,
  ExperimentId,
  ExperimentProgress,
  ProgressStep,
  QuizSubmissionResult,
  LabId,
  ObservationRecord,
} from "@/types";

export interface StepActionResult extends ActionResult {
  progress?: ExperimentProgress;
}

export interface ObservationActionResult extends ActionResult {
  record?: ObservationRecord;
  progress?: ExperimentProgress;
}

export interface QuizActionResult extends ActionResult {
  result?: QuizSubmissionResult;
  progress?: ExperimentProgress;
}

export interface SessionActionResult extends ActionResult {
  sessionId?: string;
}

const LAB_PATH = (labId: LabId) => `/labs/${labId}`;
const EXPERIMENT_PATH = (labId: LabId, experimentId: ExperimentId) =>
  `/labs/${labId}/${experimentId}`;

function nowIso() {
  return new Date().toISOString();
}

function refreshPaths(labId: LabId, experimentId?: ExperimentId) {
  revalidatePath("/dashboard");
  revalidatePath("/campus");
  revalidatePath(LAB_PATH(labId));
  revalidatePath("/labs");
  revalidatePath("/institution");
  if (experimentId) revalidatePath(EXPERIMENT_PATH(labId, experimentId));
}

function ensureProgress(
  db: DemoDatabase,
  studentId: string,
  experimentId: ExperimentId,
): ExperimentProgress {
  const existing = db.progress.find(
    (entry) => entry.studentId === studentId && entry.experimentId === experimentId,
  );
  if (existing) return existing;

  const created: ExperimentProgress = {
    studentId,
    experimentId,
    completedSteps: [],
    bestQuizScore: null,
    quizAttempts: 0,
    status: "not-started",
    startedAt: null,
    completedAt: null,
    updatedAt: nowIso(),
  };
  db.progress.push(created);
  return created;
}

function syncProgress(progress: ExperimentProgress) {
  const at = nowIso();
  progress.updatedAt = at;
  progress.startedAt ??= at;
  const complete = PROGRESS_STEP_IDS.every((step) => progress.completedSteps.includes(step));
  if (complete) {
    progress.status = "completed";
    progress.completedAt ??= at;
  } else if (progress.completedSteps.length > 0) {
    progress.status = "in-progress";
    progress.completedAt = null;
  }
}

function requireAccess(experimentId: ExperimentId, studentId: string) {
  const experiment = getExperiment(experimentId);
  if (!experiment || !experiment.published) {
    return { error: "That experiment is not available." as const, experiment: null };
  }
  if (!canAccessLab(studentId, experiment.labId)) {
    return { error: "Your institution has not granted access to this laboratory." as const, experiment: null };
  }
  return { error: null, experiment };
}

/** Marks Overview, Theory or Procedure as read. Simulation and Assessment must be earned. */
export async function markStepRead(
  experimentId: ExperimentId,
  step: ProgressStep,
): Promise<StepActionResult> {
  if (!["overview", "theory", "procedure"].includes(step)) {
    return { ok: false, message: "That section is completed by recording a result." };
  }

  const user = await requireStudent();
  const { error, experiment } = requireAccess(experimentId, user.studentId);
  if (error || !experiment) return { ok: false, message: error ?? "Experiment unavailable." };

  const progress = mutateDb((db) => {
    const entry = ensureProgress(db, user.studentId, experimentId);
    if (!entry.completedSteps.includes(step)) entry.completedSteps.push(step);
    entry.completedSteps = PROGRESS_STEP_IDS.filter((id) => entry.completedSteps.includes(id));
    syncProgress(entry);
    return { ...entry, completedSteps: [...entry.completedSteps] };
  });

  refreshPaths(experiment.labId, experimentId);
  return { ok: true, progress };
}

function sanitiseValues(values: Record<string, unknown>) {
  const clean: Record<string, number | string> = {};
  for (const [key, raw] of Object.entries(values).slice(0, 24)) {
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(key)) continue;
    if (typeof raw === "number") {
      if (Number.isFinite(raw) && Math.abs(raw) < 1e9) clean[key] = raw;
    } else if (typeof raw === "string") {
      const value = raw.trim().slice(0, 80);
      if (value) clean[key] = value;
    }
  }
  return clean;
}

export async function saveObservation(
  experimentId: ExperimentId,
  values: Record<string, unknown>,
  note?: string,
): Promise<ObservationActionResult> {
  const user = await requireStudent();
  const { error, experiment } = requireAccess(experimentId, user.studentId);
  if (error || !experiment) return { ok: false, message: error ?? "Experiment unavailable." };

  const clean = sanitiseValues(values);
  if (Object.keys(clean).length === 0) {
    return { ok: false, message: "There is no reading to record yet." };
  }

  const output = mutateDb((db) => {
    const record: ObservationRecord = {
      id: uid("ob"),
      studentId: user.studentId,
      experimentId,
      createdAt: nowIso(),
      source: "simulated",
      values: clean,
      note: note?.trim().slice(0, 240) || undefined,
    };
    db.observations.push(record);

    const entry = ensureProgress(db, user.studentId, experimentId);
    if (!entry.completedSteps.includes("simulation")) {
      entry.completedSteps.push("simulation");
    }
    entry.completedSteps = PROGRESS_STEP_IDS.filter((id) => entry.completedSteps.includes(id));
    syncProgress(entry);

    return {
      record,
      progress: { ...entry, completedSteps: [...entry.completedSteps] },
    };
  });

  refreshPaths(experiment.labId, experimentId);
  return { ok: true, record: output.record, progress: output.progress };
}

export async function submitExperimentQuiz(
  experimentId: ExperimentId,
  answers: Record<string, number>,
): Promise<QuizActionResult> {
  const user = await requireStudent();
  const { error, experiment } = requireAccess(experimentId, user.studentId);
  if (error || !experiment) return { ok: false, message: error ?? "Experiment unavailable." };

  const quiz = toPublicQuiz(experimentId);
  const graded = quiz.map((question) => {
    const chosen = answers[question.id];
    const valid = Number.isInteger(chosen) && chosen >= 0 && chosen < question.options.length;
    return { id: question.id, chosen: valid ? chosen : -1 };
  });
  if (graded.some((entry) => entry.chosen < 0)) {
    return { ok: false, message: "Answer every question before submitting." };
  }

  const content = getExperimentContent(experimentId);
  let score = 0;
  const results = content.quiz.map((question) => {
    const chosen = answers[question.id] ?? -1;
    const correct = chosen === question.answer;
    if (correct) score += 1;
    return {
      id: question.id,
      correct,
      explanation: question.explanation,
      answer: question.answer,
    };
  });

  const output = mutateDb((db) => {
    const submittedAt = nowIso();
    db.quizResults.push({
      id: uid("qr"),
      studentId: user.studentId,
      experimentId,
      score,
      total: content.quiz.length,
      submittedAt,
      answers,
    });

    const entry = ensureProgress(db, user.studentId, experimentId);
    entry.quizAttempts += 1;
    entry.bestQuizScore = Math.max(entry.bestQuizScore ?? 0, score);
    if (!entry.completedSteps.includes("assessment")) {
      entry.completedSteps.push("assessment");
    }
    entry.completedSteps = PROGRESS_STEP_IDS.filter((id) => entry.completedSteps.includes(id));
    syncProgress(entry);

    return {
      result: {
        score,
        total: content.quiz.length,
        results,
      } satisfies QuizSubmissionResult,
      progress: { ...entry, completedSteps: [...entry.completedSteps] },
    };
  });

  refreshPaths(experiment.labId, experimentId);
  return { ok: true, result: output.result, progress: output.progress };
}

export async function startLabSession(
  labId: LabId,
  experimentId?: ExperimentId,
): Promise<SessionActionResult> {
  const user = await requireStudent();
  if (!canAccessLab(user.studentId, labId)) {
    return { ok: false, message: "Your institution has not granted access to this laboratory." };
  }
  if (experimentId) {
    const experiment = getExperiment(experimentId);
    if (!experiment || experiment.labId !== labId) {
      return { ok: false, message: "That experiment does not belong to this laboratory." };
    }
  }

  const output = mutateDb((db) => {
    const active = db.sessions.find(
      (session) => session.studentId === user.studentId && session.outcome === "active",
    );
    if (active) return { sessionId: active.id, created: false };

    const at = nowIso();
    const session = {
      id: uid("ls"),
      studentId: user.studentId,
      labId,
      experimentId,
      startedAt: at,
      endedAt: null,
      outcome: "active" as const,
    };
    db.sessions.push(session);

    db.equipmentEvents.push({
      id: uid("ev"),
      labId,
      kind: "session-start",
      message: `${user.name} started a simulated session in the ${LAB_BY_ID[labId].shortName} Laboratory.`,
      at,
      source: "simulation",
      actorId: user.id,
      actorName: user.name,
    });

    return { sessionId: session.id, created: true };
  });

  refreshPaths(labId, experimentId);
  return { ok: true, sessionId: output.sessionId };
}

export async function endLabSession(
  sessionId: string,
  outcome: "completed" | "ended-early" = "completed",
): Promise<SessionActionResult> {
  const user = await requireStudent();

  const output = mutateDb((db) => {
    const session = db.sessions.find(
      (entry) => entry.id === sessionId && entry.studentId === user.studentId,
    );
    if (!session || session.outcome !== "active") return null;
    const at = nowIso();
    session.endedAt = at;
    session.outcome = outcome;

    db.equipmentEvents.push({
      id: uid("ev"),
      labId: session.labId,
      kind: "session-end",
      message: `${user.name} ended a simulated session (${outcome === "completed" ? "completed" : "ended early"}). Equipment returned to standby.`,
      at,
      source: "simulation",
      actorId: user.id,
      actorName: user.name,
    });
    db.safetyEvents.push({
      id: uid("sf"),
      labId: session.labId,
      studentId: user.studentId,
      severity: "info",
      message: "Power-off acknowledgement recorded at the end of a simulated session.",
      at,
    });

    return { labId: session.labId, experimentId: session.experimentId };
  });

  if (!output) return { ok: false, message: "That session is no longer active." };

  refreshPaths(output.labId, output.experimentId);
  return { ok: true, sessionId };
}
