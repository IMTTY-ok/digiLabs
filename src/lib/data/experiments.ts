import type { Experiment, ExperimentId, LabId } from "@/types";

/**
 * Video titles were resolved from YouTube's oEmbed endpoint on 23 Oct 2026.
 * `verified: false` marks a supplied source that could not be resolved — the UI
 * then shows a fallback instead of inventing a title.
 */
export const EXPERIMENTS: Experiment[] = [
  {
    id: "c1",
    labId: "chemistry",
    code: "CHM-C1",
    title:
      "To Determine the Concentration of Hydrochloric Acid by Titrating It Against Standard Sodium Hydroxide Solution",
    shortTitle: "HCl against standard NaOH",
    aim: "Determine the concentration of an unknown HCl solution by titration against standard NaOH.",
    durationMinutes: 45,
    difficulty: "Foundation",
    published: true,
    updatedAt: "2026-08-18T09:30:00.000Z",
    videos: [
      {
        id: "v-c1",
        title:
          "Titration || Determine the molarity of HCL by using standard slon of sodium carbonate",
        youtubeId: "YJyaCnot6d0",
        url: "https://www.youtube.com/watch?v=YJyaCnot6d0",
        verified: true,
        note: "The supplied video demonstrates an HCl titration and may label reagents differently from this NaOH simulation.",
      },
    ],
  },
  {
    id: "c2",
    labId: "chemistry",
    code: "CHM-C2",
    title:
      "To Determine the Concentration of Sodium Hydroxide Solution by Titrating It Against Standard Oxalic Acid Solution",
    shortTitle: "NaOH against standard oxalic acid",
    aim: "Determine the unknown concentration of NaOH using a standard oxalic acid solution.",
    durationMinutes: 50,
    difficulty: "Intermediate",
    published: true,
    updatedAt: "2026-08-18T09:35:00.000Z",
    videos: [
      {
        id: "v-c2",
        title:
          "Titration || determine molarity of sodium hydroxide (NaOH) by titrating it against 0.05M oxalic acid",
        youtubeId: "WXsji-QVacI",
        url: "https://www.youtube.com/watch?v=WXsji-QVacI",
        verified: true,
      },
    ],
  },
  {
    id: "e1",
    labId: "electronics",
    code: "ECE-E1",
    title: "Verification of Kirchhoff's Voltage Law in a Resistive Circuit",
    shortTitle: "Kirchhoff's Voltage Law",
    aim: "Verify that the algebraic sum of voltages around a closed circuit loop is zero.",
    durationMinutes: 40,
    difficulty: "Foundation",
    published: true,
    updatedAt: "2026-08-20T11:00:00.000Z",
    videos: [
      {
        id: "v-e1",
        title: "4. Kirchhoff's Voltage Law Lab Experiment | KVL | Basic Electrical and Electronics Engineering Lab",
        youtubeId: "fdqnYttEzPU",
        url: "https://www.youtube.com/watch?v=fdqnYttEzPU&list=PLTntHiTOym6Cp-7sufUtj_4CUJ9ALWudh",
        verified: true,
      },
    ],
  },
  {
    id: "e2",
    labId: "electronics",
    code: "ECE-E2",
    title: "Verification of Kirchhoff's Current Law in a Resistive Circuit",
    shortTitle: "Kirchhoff's Current Law",
    aim: "Verify that total current entering a circuit node equals total current leaving the node.",
    durationMinutes: 40,
    difficulty: "Foundation",
    published: true,
    updatedAt: "2026-08-20T11:10:00.000Z",
    videos: [
      {
        id: "v-e2",
        title: "5. Kirchhoff's Current Law Lab Experiment | Basic Electrical & electronics Engineering Lab | KCL",
        youtubeId: "krOWJTzjEtk",
        url: "https://www.youtube.com/watch?v=krOWJTzjEtk&list=PLTntHiTOym6Cp-7sufUtj_4CUJ9ALWudh&index=6",
        verified: true,
      },
    ],
  },
  {
    id: "i1",
    labId: "it-workshop",
    code: "ITW-I1",
    title: "Identification, Function, and Basic Working of Computer Components",
    shortTitle: "Computer components",
    aim: "Identify the principal parts of a computer and understand their functions.",
    durationMinutes: 45,
    difficulty: "Foundation",
    published: true,
    updatedAt: "2026-08-22T08:45:00.000Z",
    videos: [
      {
        id: "v-i1",
        title: "Complete PC Assembling Guide (2025) | Learn to Build a Computer at Home",
        youtubeId: "AmXBRzizPMI",
        url: "https://www.youtube.com/watch?v=AmXBRzizPMI&t=17s",
        verified: true,
        note: "Primary working reference for this module.",
      },
      {
        id: "v-i1b",
        title: null,
        youtubeId: "OdziYWEkDIM",
        url: "https://www.youtube.com/watch?v=OdziYWEkDIM",
        verified: false,
        note: "The supplied video returned an authorization error when checked. Use the provider link to open it directly if it is available to you.",
      },
    ],
  },
  {
    id: "i2",
    labId: "it-workshop",
    code: "ITW-I2",
    title: "Study and Identification of Motherboard Components and Connectors",
    shortTitle: "Motherboard study",
    aim: "Identify the major parts of a motherboard and understand their purposes.",
    durationMinutes: 50,
    difficulty: "Intermediate",
    published: true,
    updatedAt: "2026-08-22T09:05:00.000Z",
    videos: [
      {
        id: "v-i2",
        title: "Every Motherboard component Explained",
        youtubeId: "jfKOl1W8Ml4",
        url: "https://www.youtube.com/watch?v=jfKOl1W8Ml4",
        verified: true,
      },
    ],
  },
];

export const EXPERIMENT_BY_ID = Object.fromEntries(
  EXPERIMENTS.map((experiment) => [experiment.id, experiment]),
) as Record<ExperimentId, Experiment>;

export function experimentsForLab(labId: LabId): Experiment[] {
  return EXPERIMENTS.filter((experiment) => experiment.labId === labId);
}
