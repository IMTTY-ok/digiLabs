"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";

import { clearSession, setSession } from "@/lib/auth/session";
import { getUserByEmail, getStudentByUserId } from "@/lib/data/repository";

export interface SignInState {
  error?: string;
}

const DEMO_PASSWORD = process.env.DigiLab_DEMO_PASSWORD ?? "demo1234";

function passwordMatches(input: string): boolean {
  const provided = createHash("sha256").update(input).digest();
  const expected = createHash("sha256").update(DEMO_PASSWORD).digest();
  return timingSafeEqual(provided, expected);
}

/**
 * Seeded demo sign-in. The password comes from `DigiLab_DEMO_PASSWORD` (default
 * `demo1234`) and is verified only on the server. This is not production
 * authentication: a real deployment must replace it with an identity provider
 * and enforce every permission at the data layer.
 */
export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "student");

  if (!email || !password) {
    return { error: "Enter both your institutional email and password." };
  }
  if (!email.endsWith(".edu") && !email.endsWith(".ac.in") && !email.endsWith(".edu.in")) {
    // Still allow seeded addresses ending in .edu only; keep the check soft and informative.
  }

  const user = getUserByEmail(email);
  if (!user || !passwordMatches(password)) {
    return { error: "Those credentials do not match a demo account. Check the seeded accounts below." };
  }

  if (intent === "institution" && user.role === "student") {
    return { error: "This is a student account. Use the Student tab to sign in." };
  }
  if (intent === "student" && user.role !== "student") {
    return { error: "This is a staff account. Use the Institution tab to sign in." };
  }

  if (user.role === "student") {
    const student = getStudentByUserId(user.id);
    if (!student) return { error: "No student record is linked to this account." };
    if (student.status === "pending") {
      return {
        error:
          "Your institution has not approved this account yet. Contact the registrar or your laboratory instructor.",
      };
    }
    if (student.status === "suspended") {
      return { error: "This account is suspended. Contact your institution administrator." };
    }
  }

  await setSession(user.id);
  redirect(user.role === "student" ? "/dashboard" : "/institution");
}

export async function signOut() {
  await clearSession();
  redirect("/login");
}
