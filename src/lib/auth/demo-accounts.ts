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
    role: "admin",
    label: "Institution",
    name: "Dr. Meera Nair",
    email: "registrar@northline.edu",
    detail: "Administrator · Northline Institute",
  },
  {
    role: "instructor",
    label: "Instructor",
    name: "Prof. Rakesh Iyer",
    email: "faculty@northline.edu",
    detail: "Assignments, results, fault scenarios",
  },
  {
    role: "technician",
    label: "Technician",
    name: "Suresh Kamble",
    email: "technician@northline.edu",
    detail: "Inspections and equipment readiness",
  },
];

export const DEMO_PASSWORD_HINT = "demo1234";
