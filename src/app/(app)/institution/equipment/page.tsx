import type { Metadata } from "next";

import { MetaItem, PageHeader } from "@/components/layout/page-header";
import { Badge, Panel, PanelHeader, Stat } from "@/components/ui";
import { EquipmentBoard } from "@/features/institution/equipment-board";
import { requireStaff } from "@/lib/auth/session";
import { getEquipmentForLabs, getStudents } from "@/lib/data/repository";
import { LABORATORIES } from "@/lib/data/labs";

export const metadata: Metadata = { title: "Equipment" };

export default async function InstitutionEquipmentPage() {
  const user = await requireStaff(["admin", "instructor", "technician"]);
  const canManage = user.role === "admin" || user.role === "technician";

  const equipment = getEquipmentForLabs(LABORATORIES.map((lab) => lab.id));
  const attention = equipment.filter((item) =>
    ["inspection-due", "warning", "unavailable"].includes(item.status),
  );

  const items = equipment.map((item) => ({
    id: item.id,
    labId: item.labId,
    labShort: LABORATORIES.find((lab) => lab.id === item.labId)?.shortName ?? item.labId,
    name: item.name,
    category: item.category,
    status: item.status,
    source: item.source,
    lastInspection: item.lastInspection,
    nextInspection: item.nextInspection,
    note: item.note,
  }));

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Badge tone="navy" dot>
              Equipment
            </Badge>
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-faint">
              {equipment.length} items · {attention.length} flagged
            </span>
          </>
        }
        title="Equipment readiness."
        description={
          canManage
            ? "Update status and record inspections. Changes are logged as institutional records."
            : "Review equipment readiness and inspection schedules. Status changes require an administrator or technician."
        }
        meta={
          <>
            <MetaItem label="Total" value={equipment.length} />
            <MetaItem label="Flagged" value={attention.length} />
            <MetaItem label="Available" value={equipment.filter((item) => item.status === "available").length} />
          </>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <Stat label="Total items" value={equipment.length} hint="Across all labs" />
          </Panel>
          <Panel className="p-5">
            <Stat label="Needs attention" value={attention.length} hint="Inspection due, warning or unavailable" />
          </Panel>
          <Panel className="p-5">
            <Stat
              label="Inspections this cycle"
              value={equipment.filter((item) => item.status === "available").length}
              hint="Reported ready"
            />
          </Panel>
        </div>

        <EquipmentBoard items={items} canManage={canManage} />
      </div>
    </>
  );
}
