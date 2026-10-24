import { getInstitution } from "@/lib/data/repository";
import { getSessionUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const institution = getInstitution(user.institutionId);

  return (
    <AppShell user={user} institutionName={institution?.shortName ?? "Northline"}>
      {children}
    </AppShell>
  );
}
