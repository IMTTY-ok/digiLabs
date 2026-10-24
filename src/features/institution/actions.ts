"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/session";
import { LAB_BY_ID } from "@/lib/data/labs";
import { getEquipmentById, getStudentById, mutateDb } from "@/lib/data/repository";
import { uid } from "@/lib/utils/cn";
import type { AccountStatus, ActionResult, EquipmentStatus, LabId } from "@/types";

const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  "available",
  "in-use",
  "session-ended",
  "inspection-due",
  "warning",
  "unavailable",
];

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  available: "Available",
  "in-use": "In use",
  "session-ended": "Session ended",
  "inspection-due": "Inspection due",
  warning: "Warning",
  unavailable: "Unavailable",
};

function refreshStaffPaths() {
  revalidatePath("/institution");
  revalidatePath("/institution/students");
  revalidatePath("/institution/equipment");
  revalidatePath("/institution/results");
  revalidatePath("/dashboard");
  revalidatePath("/labs");
}

export async function setStudentStatus(
  studentId: string,
  status: AccountStatus,
): Promise<ActionResult> {
  const user = await requireStaff(["admin"]);
  const student = getStudentById(studentId);
  if (!student) return { ok: false, message: "Student record not found." };
  if (!["active", "pending", "suspended"].includes(status)) {
    return { ok: false, message: "Unsupported account status." };
  }

  mutateDb((db) => {
    const record = db.students.find((entry) => entry.id === studentId);
    if (record) record.status = status;
  });

  refreshStaffPaths();
  return {
    ok: true,
    message:
      status === "active"
        ? `${student.name} is approved and can sign in.`
        : `${student.name} is now ${status}.`,
  };
}

export async function setLabAccess(
  studentId: string,
  labId: LabId,
  granted: boolean,
): Promise<ActionResult> {
  await requireStaff(["admin"]);
  const student = getStudentById(studentId);
  if (!student) return { ok: false, message: "Student record not found." };
  if (!LAB_BY_ID[labId]) return { ok: false, message: "Unknown laboratory." };

  mutateDb((db) => {
    const current = new Set(db.labAccess[studentId] ?? []);
    if (granted) current.add(labId);
    else current.delete(labId);
    db.labAccess[studentId] = [...current];
  });

  refreshStaffPaths();
  return {
    ok: true,
    message: granted
      ? `${LAB_BY_ID[labId].shortName} access granted to ${student.name}.`
      : `${LAB_BY_ID[labId].shortName} access removed from ${student.name}.`,
  };
}

export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus,
  note?: string,
): Promise<ActionResult> {
  const user = await requireStaff(["admin", "technician"]);
  if (!EQUIPMENT_STATUSES.includes(status)) {
    return { ok: false, message: "Unsupported equipment status." };
  }
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) return { ok: false, message: "Equipment record not found." };

  mutateDb((db) => {
    const record = db.equipment.find((entry) => entry.id === equipmentId);
    if (!record) return;
    record.status = status;
    record.source = "record";
    if (note?.trim()) record.note = note.trim().slice(0, 220);

    db.equipmentEvents.push({
      id: uid("ev"),
      labId: record.labId,
      equipmentId: record.id,
      kind: "status-change",
      message: `${record.name} set to ${STATUS_LABEL[status]} by ${user.name}.${note?.trim() ? ` Note: ${note.trim().slice(0, 160)}` : ""}`,
      at: new Date().toISOString(),
      source: "record",
      actorId: user.id,
      actorName: user.name,
    });
  });

  refreshStaffPaths();
  revalidatePath(`/labs/${equipment.labId}`);
  return { ok: true, message: `${equipment.name} updated to ${STATUS_LABEL[status]}.` };
}

export async function recordInspection(
  equipmentId: string,
  note?: string,
): Promise<ActionResult> {
  const user = await requireStaff(["admin", "technician"]);
  const equipment = getEquipmentById(equipmentId);
  if (!equipment) return { ok: false, message: "Equipment record not found." };

  const nextInspection = new Date(Date.now() + 90 * 86_400_000).toISOString();

  mutateDb((db) => {
    const record = db.equipment.find((entry) => entry.id === equipmentId);
    if (!record) return;
    record.lastInspection = new Date().toISOString();
    record.nextInspection = nextInspection;
    if (record.status === "inspection-due" || record.status === "warning") {
      record.status = "available";
    }
    record.note = note?.trim()
      ? note.trim().slice(0, 220)
      : "Inspection logged; no defect recorded.";

    db.equipmentEvents.push({
      id: uid("ev"),
      labId: record.labId,
      equipmentId: record.id,
      kind: "inspection",
      message: `${record.name} inspected by ${user.name}; next check scheduled.`,
      at: new Date().toISOString(),
      source: "record",
      actorId: user.id,
      actorName: user.name,
    });
  });

  refreshStaffPaths();
  revalidatePath(`/labs/${equipment.labId}`);
  return { ok: true, message: `Inspection recorded for ${equipment.name}.` };
}
