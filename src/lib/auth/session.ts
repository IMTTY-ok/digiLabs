import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getStudentByUserId, getUserById } from "@/lib/data/repository";
import type { DemoUser, Role, SessionUser } from "@/types";

const COOKIE_NAME = "DigiLab_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret(): string {
  return process.env.DigiLab_SESSION_SECRET ?? "DigiLab-demo-session-secret-not-for-production";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encodeToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      uid: string;
      exp: number;
    };
    if (!parsed.uid || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

function toSessionUser(user: DemoUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    studentId: user.studentId,
    title: user.title,
  };
}

export async function setSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = decodeToken(store.get(COOKIE_NAME)?.value);
  if (!userId) return null;
  const user = getUserById(userId);
  return user ? toSessionUser(user) : null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStudent(): Promise<SessionUser & { studentId: string }> {
  const user = await requireUser();
  if (user.role !== "student" || !user.studentId) redirect("/institution");
  return user as SessionUser & { studentId: string };
}

export async function requireStaff(roles: Role[] = ["admin", "instructor"]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export async function getStudentProfileFor(user: SessionUser) {
  if (!user.studentId) return null;
  return getStudentByUserId(user.id);
}
