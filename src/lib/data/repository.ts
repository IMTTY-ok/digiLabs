import "server-only";

import fs from "node:fs";
import path from "node:path";

import { createSeedDatabase } from "@/lib/data/seed";
import type {
  DemoDatabase,
  DemoUser,
  Equipment,
  ExperimentId,
  ExperimentProgress,
  LabId,
  LearningSession,
  ObservationRecord,
  QuizResult,
  StudentProfile,
} from "@/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "labsafe-demo.json");

const globalStore = globalThis as typeof globalThis & { __labsafeDb?: DemoDatabase };

function persist(db: DemoDatabase) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
  } catch (error) {
    console.error("[labsafe] Could not persist demo database", error);
  }
}

/**
 * Demo repository backed by a JSON file in `.data/`.
 *
 * This is intentionally a stand-in for a real database. It survives dev-server
 * reloads and is readable by server components, but it is single-file, has no
 * concurrency control and is not appropriate for production. Swap this module
 * for a Firebase/Postgres-backed repository without touching UI components.
 */
export function getDb(): DemoDatabase {
  if (globalStore.__labsafeDb) return globalStore.__labsafeDb;

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as DemoDatabase;
    if (parsed.version !== 1) throw new Error("Unsupported demo database version");
    globalStore.__labsafeDb = parsed;
    return parsed;
  } catch {
    const seeded = createSeedDatabase();
    globalStore.__labsafeDb = seeded;
    persist(seeded);
    return seeded;
  }
}

export function mutateDb<T>(mutator: (db: DemoDatabase) => T): T {
  const db = getDb();
  const result = mutator(db);
  persist(db);
  return result;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function getUserById(userId: string): DemoUser | null {
  return getDb().users.find((user) => user.id === userId) ?? null;
}

export function getUserByEmail(email: string): DemoUser | null {
  return getDb().users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getInstitution(institutionId: string) {
  return getDb().institutions.find((institution) => institution.id === institutionId) ?? null;
}

export function getStudentById(studentId: string): StudentProfile | null {
  return getDb().students.find((student) => student.id === studentId) ?? null;
}

export function getStudentByUserId(userId: string): StudentProfile | null {
  return getDb().students.find((student) => student.userId === userId) ?? null;
}

export function getStudents(): StudentProfile[] {
  return [...getDb().students].sort((a, b) => a.name.localeCompare(b.name));
}

export function getLabAccess(studentId: string): LabId[] {
  return getDb().labAccess[studentId] ?? [];
}

export function canAccessLab(studentId: string, labId: LabId): boolean {
  return getLabAccess(studentId).includes(labId);
}

export function canAccessExperiment(studentId: string, labId: LabId, publishedOnly = true): boolean {
  if (!canAccessLab(studentId, labId)) return false;
  if (!publishedOnly) return true;
  return getDb().experiments.some((experiment) => experiment.labId === labId && experiment.published);
}

export function getExperiments() {
  return getDb().experiments;
}

export function getExperiment(experimentId: ExperimentId) {
  return getDb().experiments.find((experiment) => experiment.id === experimentId) ?? null;
}

export function isExperimentPublished(experimentId: ExperimentId): boolean {
  return getExperiment(experimentId)?.published ?? false;
}

export function getEquipmentForLab(labId: LabId): Equipment[] {
  return getDb().equipment.filter((equipment) => equipment.labId === labId);
}

export function getEquipmentForLabs(labIds: LabId[]): Equipment[] {
  return getDb().equipment.filter((equipment) => labIds.includes(equipment.labId));
}

export function getEquipmentEvents(labIds?: LabId[], limit = 40) {
  const db = getDb();
  return db.equipmentEvents
    .filter((event) => (labIds ? labIds.includes(event.labId) : true))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export function getSafetyEvents(labIds?: LabId[], limit = 40) {
  const db = getDb();
  return db.safetyEvents
    .filter((event) => (labIds ? labIds.includes(event.labId) : true))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

export function getProgressForStudent(studentId: string): ExperimentProgress[] {
  return getDb().progress.filter((progress) => progress.studentId === studentId);
}

export function getProgress(studentId: string, experimentId: ExperimentId): ExperimentProgress {
  const existing = getDb().progress.find(
    (progress) => progress.studentId === studentId && progress.experimentId === experimentId,
  );
  if (existing) return existing;
  const now = new Date().toISOString();
  return {
    studentId,
    experimentId,
    completedSteps: [],
    bestQuizScore: null,
    quizAttempts: 0,
    status: "not-started",
    startedAt: null,
    completedAt: null,
    updatedAt: now,
  };
}

export function getObservationRecords(studentId: string, experimentId: ExperimentId) {
  return getDb()
    .observations.filter(
      (record) => record.studentId === studentId && record.experimentId === experimentId,
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getQuizResults(studentId: string, experimentId?: ExperimentId) {
  return getDb().quizResults.filter(
    (result) =>
      result.studentId === studentId && (experimentId ? result.experimentId === experimentId : true),
  );
}

export function getSessions(studentId?: string, limit = 20) {
  return getDb()
    .sessions.filter((session) => (studentId ? session.studentId === studentId : true))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

export function getAssignments(studentId: string) {
  return getDb().assignments.filter((assignment) => assignment.studentId === studentId);
}

export function getInstitutionOverview() {
  const db = getDb();
  const active = db.students.filter((student) => student.status === "active").length;
  const pending = db.students.filter((student) => student.status === "pending").length;
  return {
    active,
    pending,
    total: db.students.length,
    labs: 3,
    publishedExperiments: db.experiments.filter((experiment) => experiment.published).length,
    equipmentAttention: db.equipment.filter((equipment) =>
      ["inspection-due", "warning", "unavailable"].includes(equipment.status),
    ).length,
    sessions: db.sessions.length,
  };
}

/* ------------------------------------------------------------------ */
/* Staff-wide queries                                                  */
/* ------------------------------------------------------------------ */

export function getAllProgress(): ExperimentProgress[] {
  return getDb().progress;
}

export function getAllQuizResults(experimentId?: ExperimentId): QuizResult[] {
  return getDb().quizResults.filter((result) =>
    experimentId ? result.experimentId === experimentId : true,
  );
}

export function getAllSessionRecords(limit = 50): LearningSession[] {
  return [...getDb().sessions]
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit);
}

export function getActiveSessionForStudent(studentId: string): LearningSession | null {
  return (
    getDb().sessions.find((session) => session.studentId === studentId && session.outcome === "active") ??
    null
  );
}

export function getEquipmentById(equipmentId: string): Equipment | null {
  return getDb().equipment.find((equipment) => equipment.id === equipmentId) ?? null;
}

export function getPendingStudents(): StudentProfile[] {
  return getStudents().filter((student) => student.status === "pending");
}

export function getObservationsForStudent(studentId: string): ObservationRecord[] {
  return getDb().observations.filter((record) => record.studentId === studentId);
}

export function getObservationCount(studentId: string, experimentId?: ExperimentId): number {
  return getDb().observations.filter(
    (record) =>
      record.studentId === studentId && (experimentId ? record.experimentId === experimentId : true),
  ).length;
}

export function getLabActivity(labIds: LabId[], limit = 24) {
  const db = getDb();
  const equipmentEvents = db.equipmentEvents
    .filter((event) => labIds.includes(event.labId))
    .map((event) => ({
      id: event.id,
      kind: event.kind,
      labId: event.labId,
      message: event.message,
      at: event.at,
      source: event.source,
      actorName: event.actorName,
    }));
  const safetyEvents = db.safetyEvents
    .filter((event) => labIds.includes(event.labId))
    .map((event) => ({
      id: event.id,
      kind: "safety" as const,
      labId: event.labId,
      message: event.message,
      at: event.at,
      source: "record" as const,
      actorName: undefined,
    }));
  return [...equipmentEvents, ...safetyEvents]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}
