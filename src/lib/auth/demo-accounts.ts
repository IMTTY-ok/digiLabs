export interface DemoAccountHint {
  role: "student" | "admin" | "instructor" | "technician";
  label: string;
  name: string;
  email: string;
  detail: string;
}

/**
 * Public demo directory. Passwords are not part of this list and are verified
 * server-side in `actions.ts`.
 */
export const DEMO_ACCOUNTS: DemoAccountHint[] = [
  {
    role: "student",
    label: "Student",
    name: "Arjun Mehta",
    email: "arjun.mehta@student.northline.edu",
    detail: "Chemistry + Electronics access · First Year CSE",
  },
  {
    role: "student",
    label: "Student (pending)",
    name: "Sara Khan",
    email: "sara.khan@student.northline.edu",
    detail: "Awaiting approval — sign-in is blocked",
  },
  {
    role: "student",
    label: "Student",
    name: "Dev Patel",
    email: "dev.patel@student.northline.edu",
    detail: "Chemistry + IT Workshop access · First Year ME",
  },
  {
    role: "student",
    label: "Student",
    name: "Isha Rao",
    email: "isha.rao@student.northline.edu",
    detail: "Chemistry + Electronics + IT Workshop · First Year IT",
  },
  {
    role: "admin",
    label: "Institution",
    name: "Dr. Meera Nair",
    email: "registrar@northline.edu",
    detail: "Administrator · Northline Institute",
  },
];

export const DEMO_PASSWORD_HINT = "demo1234";
