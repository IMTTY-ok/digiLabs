import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/data/repository";
import { LAB_BY_ID } from "@/lib/data/labs";
import type { LabId } from "@/types";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "instructor" && user.role !== "technician")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const labId = searchParams.get("labId") as LabId | null;

  const db = getDb();
  const sessions = db.sessions.filter((session) => (labId ? session.labId === labId : true));

  const groups = new Map<
    string,
    {
      studentId: string;
      labId: LabId;
      sessions: number;
      completed: number;
      experiments: Set<string>;
      bestScore: number | null;
      bestTotal: number | null;
      lastActivity: string;
    }
  >();

  for (const session of sessions) {
    const key = `${session.studentId}::${session.labId}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        studentId: session.studentId,
        labId: session.labId,
        sessions: 0,
        completed: 0,
        experiments: new Set(),
        bestScore: null,
        bestTotal: null,
        lastActivity: session.startedAt,
      };
      groups.set(key, group);
    }
    group.sessions += 1;
    if (session.outcome === "completed") group.completed += 1;
    if (session.experimentId) group.experiments.add(session.experimentId);
    if (session.startedAt > group.lastActivity) group.lastActivity = session.startedAt;
  }

  // Best quiz score per student/lab (best across experiments in that lab)
  const quizByStudentLab = new Map<string, { score: number; total: number }>();
  for (const result of db.quizResults) {
    const experiment = db.experiments.find((item) => item.id === result.experimentId);
    if (!experiment) continue;
    if (labId && experiment.labId !== labId) continue;
    const key = `${result.studentId}::${experiment.labId}`;
    if (!groups.has(key)) continue;
    const current = quizByStudentLab.get(key);
    if (!current || result.score / result.total > current.score / current.total) {
      quizByStudentLab.set(key, { score: result.score, total: result.total });
    }
  }

  const rows: string[] = [];
  rows.push(
    [
      "Student",
      "Roll No",
      "Email",
      "Lab",
      "Sessions",
      "Completed Sessions",
      "Experiments Performed",
      "Best Assessment",
      "Last Activity",
    ].join(","),
  );

  const escape = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  for (const group of groups.values()) {
    const student = db.students.find((item) => item.id === group.studentId);
    const lab = LAB_BY_ID[group.labId];
    const quiz = quizByStudentLab.get(`${group.studentId}::${group.labId}`);
    rows.push(
      [
        escape(student?.name ?? group.studentId),
        escape(student?.rollNo ?? ""),
        escape(student?.email ?? ""),
        escape(lab?.shortName ?? group.labId),
        String(group.sessions),
        String(group.completed),
        escape([...group.experiments].join("; ")),
        quiz ? `${quiz.score}/${quiz.total}` : "",
        escape(new Date(group.lastActivity).toLocaleString("en-IN")),
      ].join(","),
    );
  }

  const csv = rows.join("\n");
  const filename = labId ? `students-${labId}.csv` : "students-all-labs.csv";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}