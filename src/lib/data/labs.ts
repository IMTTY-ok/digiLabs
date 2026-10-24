import type { CampusDestination, Laboratory } from "@/types";

export const LABORATORIES: Laboratory[] = [
  {
    id: "chemistry",
    name: "Chemistry Laboratory",
    shortName: "Chemistry",
    code: "CHM-104",
    room: "Block A · Wet Lab 02",
    capacity: 32,
    description:
      "A wet-chemistry teaching laboratory for volumetric analysis. Bench-mounted burettes, a fume hood and a reagent store support first-year acid–base work.",
    focus: ["Volumetric analysis", "Acid–base titration", "Glassware handling"],
    accent: "cobalt",
  },
  {
    id: "electronics",
    name: "Basic Electronics Engineering Laboratory",
    shortName: "Electronics",
    code: "ECE-102",
    room: "Block B · Circuits Lab 01",
    capacity: 28,
    description:
      "A low-voltage circuits laboratory with instrumented benches, regulated DC supplies, breadboards and digital multimeters for foundational network theorems.",
    focus: ["Ohm's law", "KVL & KCL", "Instrument practice"],
    accent: "cyan",
  },
  {
    id: "it-workshop",
    name: "IT Workshop Laboratory",
    shortName: "IT Workshop",
    code: "ITW-101",
    room: "Block C · Hardware Bay",
    capacity: 24,
    description:
      "A hardware workshop for computer assembly and component study: open test benches, anti-static stations, system units and disassembly trays.",
    focus: ["PC components", "Motherboard study", "Safe handling"],
    accent: "amber",
  },
];

export const LAB_BY_ID = Object.fromEntries(LABORATORIES.map((lab) => [lab.id, lab])) as Record<
  Laboratory["id"],
  Laboratory
>;

/** Camera presets and marker positions for the 3D campus, in metres. */
export const CAMPUS_DESTINATIONS: CampusDestination[] = [
  {
    id: "chemistry",
    name: "Chemistry Laboratory",
    shortName: "Chemistry",
    code: "CHM-104",
    description:
      "Wet lab with burette stations and a fume hood. Two volumetric analysis experiments are provisioned.",
    focus: ["Acid–base titration", "Glassware", "Endpoint technique"],
    accent: "cobalt",
    room: "Block A · Wet Lab 02",
    marker: [-16, 1.4, 2.5],
    camera: [-23, 9.5, 15],
    target: [-15.5, 3.2, -8.5],
  },
  {
    id: "electronics",
    name: "Basic Electronics Engineering Laboratory",
    shortName: "Electronics",
    code: "ECE-102",
    description:
      "Circuits benches with DC supplies and meters. Kirchhoff's voltage and current laws are provisioned.",
    focus: ["KVL", "KCL", "Multimeter practice"],
    accent: "cyan",
    room: "Block B · Circuits Lab 01",
    marker: [0, 1.4, -1.5],
    camera: [0, 8.5, 18],
    target: [0, 3.4, -8.5],
  },
  {
    id: "it-workshop",
    name: "IT Workshop Laboratory",
    shortName: "IT Workshop",
    code: "ITW-101",
    description:
      "Hardware bay with open test benches. Component identification and motherboard study are provisioned.",
    focus: ["PC hardware", "Motherboard", "ESD safety"],
    accent: "amber",
    room: "Block C · Hardware Bay",
    marker: [16, 1.4, 2.5],
    camera: [23, 9.5, 15],
    target: [15.5, 3.2, -8.5],
  },
];

export const CAMPUS_OVERVIEW = {
  camera: [0, 16, 34] as [number, number, number],
  target: [0, 3.2, -7] as [number, number, number],
};

export const ACCENT_HEX: Record<Laboratory["accent"], string> = {
  cobalt: "#1e5bc6",
  cyan: "#177f8c",
  amber: "#a9660f",
};
