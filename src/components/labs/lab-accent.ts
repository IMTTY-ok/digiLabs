import type { Laboratory } from "@/types";

export type LabAccent = Laboratory["accent"];

export interface AccentTheme {
  label: string;
  hex: string;
  text: string;
  textDeep: string;
  bg: string;
  bgSoft: string;
  border: string;
  borderSoft: string;
  bar: "cobalt" | "cyan" | "amber";
  dot: string;
  badge: string;
  ring: string;
}

export const ACCENT_THEME: Record<LabAccent, AccentTheme> = {
  cobalt: {
    label: "Cobalt",
    hex: "#1e5bc6",
    text: "text-cobalt",
    textDeep: "text-cobalt-deep",
    bg: "bg-cobalt",
    bgSoft: "bg-cobalt/[0.07]",
    border: "border-cobalt",
    borderSoft: "border-cobalt/25",
    bar: "cobalt",
    dot: "bg-cobalt",
    badge: "border-cobalt/25 bg-cobalt/[0.07] text-cobalt-deep",
    ring: "ring-cobalt/20",
  },
  cyan: {
    label: "Cyan",
    hex: "#177f8c",
    text: "text-cyan",
    textDeep: "text-cyan",
    bg: "bg-cyan",
    bgSoft: "bg-cyan-wash",
    border: "border-cyan",
    borderSoft: "border-cyan/25",
    bar: "cyan",
    dot: "bg-cyan",
    badge: "border-cyan/25 bg-cyan-wash text-cyan",
    ring: "ring-cyan/20",
  },
  amber: {
    label: "Amber",
    hex: "#a9660f",
    text: "text-amber",
    textDeep: "text-amber",
    bg: "bg-amber",
    bgSoft: "bg-amber-wash",
    border: "border-amber",
    borderSoft: "border-amber/30",
    bar: "amber",
    dot: "bg-amber",
    badge: "border-amber/30 bg-amber-wash text-amber",
    ring: "ring-amber/20",
  },
};

export function accentTheme(accent: LabAccent) {
  return ACCENT_THEME[accent];
}
