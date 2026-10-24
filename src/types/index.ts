export type Role = "student" | "instructor" | "admin" | "technician";

export type LabId = "chemistry" | "electronics" | "it-workshop";

export type ExperimentId = "c1" | "c2" | "e1" | "e2" | "i1" | "i2";

export type Difficulty = "Foundation" | "Intermediate";

export type AccountStatus = "active" | "pending" | "suspended";

export type ExperimentStatus = "not-started" | "in-progress" | "completed";

/** Ordered sections a student works through inside an experiment. */
export type ProgressStep = "overview" | "theory" | "procedure" | "simulation" | "assessment";

export type EquipmentStatus =
  | "available"
  | "in-use"
  | "session-ended"
  | "inspection-due"
  | "warning"
  | "unavailable";

/** Where a status or reading comes from. Never present a simulation as verified hardware. */
export type StatusSource = "simulation" | "record" | "sensor";

export type DataSource = "simulated" | "student-entered" | "instructor-provided";

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  code: string;
  city: string;
  academicYear: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId: string;
  studentId?: string;
  title?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  course: string;
  stream: string;
  academicYear: string;
  status: AccountStatus;
  createdAt: string;
}

export interface Laboratory {
  id: LabId;
  name: string;
  shortName: string;
  code: string;
  room: string;
  capacity: number;
  description: string;
  focus: string[];
  accent: "cobalt" | "cyan" | "amber";
}

export interface VideoResource {
  id: string;
  /** Verified title, or null when the supplied source could not be verified. */
  title: string | null;
  youtubeId: string;
  url: string;
  verified: boolean;
  note?: string;
}

export interface Experiment {
  id: ExperimentId;
  labId: LabId;
  code: string;
  title: string;
  shortTitle: string;
  aim: string;
  durationMinutes: number;
  difficulty: Difficulty;
  published: boolean;
  videos: VideoResource[];
  updatedAt: string;
}

export interface ExperimentAssignment {
  id: string;
  studentId: string;
  experimentId: ExperimentId;
  assignedBy: string;
  assignedAt: string;
}

export interface Equipment {
  id: string;
  labId: LabId;
  name: string;
  category: string;
  status: EquipmentStatus;
  source: StatusSource;
  lastInspection: string;
  nextInspection: string;
  note?: string;
}

export interface EquipmentEvent {
  id: string;
  equipmentId?: string;
  labId: LabId;
  kind:
    | "entry"
    | "session-start"
    | "session-end"
    | "power-warning"
    | "status-change"
    | "inspection"
    | "safety";
  message: string;
  at: string;
  source: StatusSource;
  actorId?: string;
  actorName?: string;
}

export interface SafetyEvent {
  id: string;
  labId: LabId;
  studentId?: string;
  severity: "info" | "caution" | "critical";
  message: string;
  at: string;
}

export interface ObservationRecord {
  id: string;
  studentId: string;
  experimentId: ExperimentId;
  createdAt: string;
  source: DataSource;
  values: Record<string, number | string>;
  note?: string;
}

export interface QuizResult {
  id: string;
  studentId: string;
  experimentId: ExperimentId;
  score: number;
  total: number;
  submittedAt: string;
  answers: Record<string, number>;
}

export interface ExperimentProgress {
  studentId: string;
  experimentId: ExperimentId;
  completedSteps: ProgressStep[];
  bestQuizScore: number | null;
  quizAttempts: number;
  status: ExperimentStatus;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface LearningSession {
  id: string;
  studentId: string;
  labId: LabId;
  experimentId?: ExperimentId;
  startedAt: string;
  endedAt: string | null;
  outcome: "active" | "completed" | "ended-early";
}

export interface DemoDatabase {
  version: 1;
  seededAt: string;
  institutions: Institution[];
  users: DemoUser[];
  students: StudentProfile[];
  experiments: Experiment[];
  labAccess: Record<string, LabId[]>;
  assignments: ExperimentAssignment[];
  equipment: Equipment[];
  equipmentEvents: EquipmentEvent[];
  safetyEvents: SafetyEvent[];
  progress: ExperimentProgress[];
  quizResults: QuizResult[];
  sessions: LearningSession[];
  observations: ObservationRecord[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId: string;
  studentId?: string;
  title?: string;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export type CampusDestination = {
  id: LabId;
  name: string;
  shortName: string;
  code: string;
  description: string;
  focus: string[];
  accent: "cobalt" | "cyan" | "amber";
  room: string;
  marker: [number, number, number];
  camera: [number, number, number];
  target: [number, number, number];
};

export interface QuizQuestionPublic {
  id: string;
  prompt: string;
  options: string[];
}

export interface QuizQuestion extends QuizQuestionPublic {
  answer: number;
  explanation: string;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  results: Array<{ id: string; correct: boolean; explanation: string; answer: number }>;
}
