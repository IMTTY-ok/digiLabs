import type { ExperimentContent } from "@/features/experiments/content-types";

export const C1_CONTENT: ExperimentContent = {
  overview:
    "You are given a hydrochloric acid solution of unknown concentration and a standard sodium hydroxide solution. By delivering NaOH from a burette into a measured volume of HCl until phenolphthalein shows a persistent faint pink, you can calculate the acid concentration from the volume used.",
  objectives: [
    "Explain acid–base neutralisation and the role of a standard solution.",
    "Handle a pipette and burette correctly and read the meniscus.",
    "Identify the phenolphthalein endpoint in an acid-in-flask titration.",
    "Calculate an unknown molarity from titre volume and reaction stoichiometry.",
    "Record concordant titres and report the result with appropriate precision.",
  ],
  apparatus: [
    "50 mL burette with stand and clamp",
    "25 mL pipette and pipette filler",
    "250 mL conical flask",
    "Small funnel and 100 mL beakers",
    "Standard NaOH solution (0.100 M)",
    "HCl solution of unknown concentration",
    "Phenolphthalein indicator",
    "Distilled water and wash bottle",
  ],
  theory: [
    {
      heading: "Neutralisation",
      paragraphs: [
        "Hydrochloric acid reacts with sodium hydroxide in a 1:1 mole ratio. At the equivalence point the acid has been exactly neutralised and neither reactant is in excess.",
        "Because both reactants are monobasic, the mole ratio in the balanced equation is the same as the coefficient ratio: one mole of HCl consumes one mole of NaOH.",
      ],
      formula: "HCl + NaOH → NaCl + H₂O",
      formulaCaption: "Strong acid + strong base → salt + water",
    },
    {
      heading: "The standard solution",
      paragraphs: [
        "A standard solution has an accurately known concentration. NaOH is the standard here, so the number of moles delivered from the burette is known exactly: n(NaOH) = M(NaOH) × V(NaOH).",
        "The HCl volume is fixed by the pipette. At the endpoint, n(HCl) = n(NaOH), which allows the unknown molarity to be calculated.",
      ],
      formula: "M(HCl) × V(HCl) = M(NaOH) × V(NaOH)",
      formulaCaption: "Use the same volume unit on both sides (mL is acceptable).",
    },
    {
      heading: "Endpoint and indicator",
      paragraphs: [
        "Phenolphthalein is colourless in acidic solution and pink above roughly pH 8.2. With HCl in the flask, the first permanent faint pink signals a slight excess of NaOH — the practical endpoint.",
        "The endpoint is an experimental approximation of the equivalence point. Adding one drop at a time near the expected titre prevents overshooting.",
      ],
    },
    {
      heading: "Reporting the result",
      paragraphs: [
        "Repeat the titration until you have concordant titre values (within 0.10 mL). Use the mean of concordant values in the calculation and report molarity to three or four significant figures.",
      ],
    },
  ],
  procedure: [
    {
      title: "Prepare and inspect the apparatus",
      detail:
        "Rinse the burette with distilled water and then a little standard NaOH. Clamp it vertically and check that the stopcock does not leak.",
    },
    {
      title: "Fill the burette",
      detail:
        "Fill with standard NaOH above the zero mark, run a little through the tip to remove air bubbles, then adjust the meniscus to a readable initial value.",
    },
    {
      title: "Pipette the acid",
      detail:
        "Rinse the pipette with the HCl solution, pipette exactly 25.00 mL into a clean conical flask, and add 2–3 drops of phenolphthalein.",
    },
    {
      title: "Begin the titration",
      detail:
        "Place the flask under the burette on a white tile. Add NaOH in mL portions while swirling the flask continuously.",
    },
    {
      title: "Slow down near the endpoint",
      detail:
        "When a pink flash appears and fades, reduce additions to dropwise. Rinse the flask walls with distilled water if needed.",
    },
    {
      title: "Record the endpoint",
      detail:
        "Stop at the first persistent faint pink that lasts while swirling. Read the final burette value at eye level from the bottom of the meniscus.",
    },
    {
      title: "Repeat for concordance",
      detail:
        "Carry out at least two further titrations. Accept titres within 0.10 mL of each other and average the concordant values.",
    },
    {
      title: "Calculate",
      detail:
        "Substitute the mean titre into M(HCl) = M(NaOH) × V(NaOH) / V(HCl) and state the result with units.",
    },
  ],
  precautions: [
    "Wear splash-proof goggles and a lab coat throughout.",
    "Read the burette at eye level to avoid parallax error.",
    "Remove air bubbles from the burette tip before recording the initial reading.",
    "Add the last portion dropwise; a single extra drop can overshoot the endpoint.",
    "Do not blow into the pipette — use a pipette filler.",
    "Never return unused reagent to its stock bottle.",
  ],
  safety: [
    "HCl and NaOH are corrosive at the concentrations used; avoid skin and eye contact.",
    "If a spill occurs, stop, warn neighbours and report it to the instructor. Do not neutralise spills yourself.",
    "Keep the working area clear of bags and loose clothing.",
    "Handle glassware carefully and report chips or cracks before use.",
    "Wash hands after handling reagents, even in a simulated session.",
  ],
  practice: [
    {
      question:
        "A 25.00 mL aliquot of HCl required 22.40 mL of 0.100 M NaOH. Calculate the HCl molarity.",
      answer: "M(HCl) = (0.100 × 22.40) / 25.00 = 0.0896 M.",
    },
    {
      question:
        "Why is the flask rinsed with distilled water, but the pipette rinsed with the acid solution?",
      answer:
        "Water in the flask only dilutes the acid and does not change the number of moles to be neutralised. Water left in the pipette would dilute the aliquot, so the pipette is rinsed with the solution it must deliver.",
    },
  ],
  quiz: [
    {
      id: "c1-q1",
      prompt: "In this titration, which solution is the standard solution?",
      options: ["HCl, because it is in the flask", "NaOH, because its concentration is known", "Both solutions", "Neither; the indicator is standard"],
      answer: 1,
      explanation:
        "The standard solution has an accurately known concentration. Here NaOH is standard and HCl is the unknown analyte.",
    },
    {
      id: "c1-q2",
      prompt: "At the equivalence point, what is the mole relationship between HCl and NaOH?",
      options: ["n(HCl) = 2 × n(NaOH)", "n(NaOH) = 2 × n(HCl)", "n(HCl) = n(NaOH)", "n(HCl) + n(NaOH) = 0"],
      answer: 2,
      explanation: "HCl + NaOH → NaCl + H₂O is a 1:1 reaction, so the moles are equal at equivalence.",
    },
    {
      id: "c1-q3",
      prompt: "With HCl in the flask, the phenolphthalein endpoint is:",
      options: ["A permanent deep red", "The first persistent faint pink", "A colourless solution", "A yellow colour"],
      answer: 1,
      explanation:
        "Phenolphthalein turns pink in basic solution. The first persistent faint pink indicates a slight excess of NaOH — the practical endpoint.",
    },
    {
      id: "c1-q4",
      prompt: "How should the burette meniscus be read?",
      options: ["From above the meniscus", "At eye level, from the bottom of the meniscus", "From the top of the liquid column", "At any angle, since the error cancels"],
      answer: 1,
      explanation:
        "Reading at eye level from the bottom of the meniscus avoids parallax error; the burette is calibrated for that reading.",
    },
    {
      id: "c1-q5",
      prompt: "A 20.00 mL HCl aliquot required 25.00 mL of 0.100 M NaOH. The HCl concentration is:",
      options: ["0.0800 M", "0.125 M", "0.100 M", "1.25 M"],
      answer: 1,
      explanation: "M(HCl) = (0.100 × 25.00) / 20.00 = 0.125 M. Option A comes from dividing the volumes the wrong way round.",
    },
    {
      id: "c1-q6",
      prompt: "What is the main reason for repeating the titration?",
      options: [
        "To use more chemicals",
        "To obtain concordant titres and reduce random error",
        "To change the indicator",
        "To increase the concentration of the acid",
      ],
      answer: 1,
      explanation:
        "Concordant titres within about 0.10 mL reduce random error and give a more reliable mean value.",
    },
  ],
};

export const C2_CONTENT: ExperimentContent = {
  overview:
    "Sodium hydroxide of unknown concentration is delivered from a burette into a measured volume of standard oxalic acid. Because oxalic acid is diprotic, two moles of NaOH are required per mole of acid. Phenolphthalein marks the first persistent pink.",
  objectives: [
    "Write the balanced neutralisation of a diprotic acid with a strong base.",
    "Apply the stoichiometric factor of two in the titration calculation.",
    "Handle a burette and read volumes to the correct precision.",
    "Identify a persistent phenolphthalein endpoint.",
    "Calculate the unknown NaOH concentration from standard oxalic acid data.",
  ],
  apparatus: [
    "50 mL burette with stand and clamp",
    "20 mL pipette and filler",
    "250 mL conical flask",
    "Funnel and beakers",
    "Standard oxalic acid solution (0.050 M)",
    "NaOH solution of unknown concentration",
    "Phenolphthalein indicator",
    "Distilled water",
  ],
  theory: [
    {
      heading: "A diprotic acid",
      paragraphs: [
        "Oxalic acid (H₂C₂O₄) can donate two protons per molecule. Complete neutralisation therefore requires two hydroxide ions, giving a 1:2 acid-to-base mole ratio.",
        "The coefficient 2 in the balanced equation is not optional: omitting it halves the calculated NaOH concentration.",
      ],
      formula: "H₂C₂O₄ + 2NaOH → Na₂C₂O₄ + 2H₂O",
      formulaCaption: "One mole of oxalic acid neutralises two moles of sodium hydroxide.",
    },
    {
      heading: "The titration relationship",
      paragraphs: [
        "Oxalic acid is the standard solution in the flask. At the endpoint, n(NaOH) = 2 × n(oxalic acid).",
        "Expanding the moles as molarity × volume gives the working equation used in this experiment.",
      ],
      formula: "M(NaOH) = 2 × M(oxalic acid) × V(oxalic acid) / V(NaOH)",
      formulaCaption: "V(NaOH) is the titre delivered from the burette.",
    },
    {
      heading: "Why the flask is basic at the endpoint",
      paragraphs: [
        "Phenolphthalein changes colour only once the solution is slightly basic. At the equivalence point of oxalic acid and NaOH the solution contains sodium oxalate, which is weakly basic, so a persistent faint pink appears close to equivalence.",
        "Beyond the endpoint the pink deepens as excess NaOH accumulates.",
      ],
    },
    {
      heading: "Practical precision",
      paragraphs: [
        "Use a white tile beneath the flask to see the colour change clearly. Near the endpoint, add NaOH dropwise and swirl after every addition.",
        "Record burette readings to 0.05 mL (two decimal places) and average concordant titres.",
      ],
    },
  ],
  procedure: [
    {
      title: "Prepare the burette",
      detail:
        "Rinse the burette with distilled water and a little NaOH solution, clamp it vertically, and fill it above the zero mark.",
    },
    {
      title: "Remove air and set the zero",
      detail:
        "Run solution through the tip to expel air bubbles. Adjust the meniscus to a recorded initial reading.",
    },
    {
      title: "Measure the standard acid",
      detail:
        "Pipette 20.00 mL of 0.050 M oxalic acid into a clean conical flask and add 2–3 drops of phenolphthalein.",
    },
    {
      title: "Titrate with swirling",
      detail:
        "Run NaOH into the flask while swirling. The pink colour will fade on swirling before the endpoint.",
    },
    {
      title: "Approach dropwise",
      detail:
        "Slow to dropwise addition when a pink flash persists for several seconds. Stop at the first persistent faint pink.",
    },
    {
      title: "Record and repeat",
      detail:
        "Record the final burette reading, refill, and repeat until concordant titres are obtained.",
    },
    {
      title: "Calculate and report",
      detail:
        "Apply M(NaOH) = 2 × M(oxalic acid) × V(oxalic acid) / V(NaOH) using the mean concordant titre.",
    },
  ],
  precautions: [
    "Oxalic acid is toxic and corrosive; avoid contact and do not ingest.",
    "NaOH is corrosive and slippery when spilled — clean immediately and report it.",
    "Use a pipette filler; never pipette by mouth.",
    "Keep the burette tip filled; an air bubble causes a volume error.",
    "Add near the endpoint dropwise to avoid overshooting.",
    "Dispose of waste in the labelled container, not the sink.",
  ],
  safety: [
    "Wear goggles, a lab coat and gloves when handling oxalic acid or NaOH.",
    "Work in a well-ventilated area and avoid inhaling dust from solid oxalic acid.",
    "Report spills and broken glass to the instructor immediately.",
    "Wash hands thoroughly after handling reagents.",
    "This simulation does not replace supervised wet-lab practice.",
  ],
  practice: [
    {
      question:
        "20.00 mL of 0.050 M oxalic acid required 19.60 mL of NaOH. Calculate M(NaOH).",
      answer: "M(NaOH) = (2 × 0.050 × 20.00) / 19.60 = 0.1020 M.",
    },
    {
      question: "Why is the calculated NaOH concentration doubled compared with a monobasic acid calculation?",
      answer:
        "Each oxalic acid molecule supplies two protons, so twice as many moles of NaOH are consumed. The factor of 2 accounts for that stoichiometry.",
    },
  ],
  quiz: [
    {
      id: "c2-q1",
      prompt: "How many moles of NaOH react with one mole of oxalic acid?",
      options: ["1", "2", "3", "0.5"],
      answer: 1,
      explanation:
        "H₂C₂O₄ is diprotic: H₂C₂O₄ + 2NaOH → Na₂C₂O₄ + 2H₂O, so the ratio is 1:2.",
    },
    {
      id: "c2-q2",
      prompt: "In this experiment, which solution is delivered from the burette?",
      options: ["Standard oxalic acid", "NaOH of unknown concentration", "Phenolphthalein", "Distilled water"],
      answer: 1,
      explanation:
        "The unknown NaOH is in the burette; the standard oxalic acid is pipetted into the flask.",
    },
    {
      id: "c2-q3",
      prompt: "Which calculation is correct?",
      options: [
        "M(NaOH) = M(oxalic) × V(oxalic) / V(NaOH)",
        "M(NaOH) = 2 × M(oxalic) × V(oxalic) / V(NaOH)",
        "M(NaOH) = M(oxalic) × V(NaOH) / (2 × V(oxalic))",
        "M(NaOH) = 2 × M(oxalic) × V(NaOH) / V(oxalic)",
      ],
      answer: 1,
      explanation:
        "n(NaOH) = 2 × n(oxalic), and n = M × V. Rearranging gives option B.",
    },
    {
      id: "c2-q4",
      prompt: "20.00 mL of 0.050 M oxalic acid required 20.00 mL of NaOH. M(NaOH) is:",
      options: ["0.025 M", "0.050 M", "0.100 M", "0.200 M"],
      answer: 2,
      explanation: "M(NaOH) = 2 × 0.050 × 20.00 / 20.00 = 0.100 M.",
    },
    {
      id: "c2-q5",
      prompt: "The first persistent faint pink indicates that:",
      options: [
        "All the oxalic acid has been destroyed",
        "A slight excess of NaOH is present",
        "The solution has become strongly acidic",
        "The indicator has decomposed",
      ],
      answer: 1,
      explanation:
        "Phenolphthalein turns pink in basic conditions. A faint persistent pink means the acid has been neutralised and a small excess of base is present.",
    },
    {
      id: "c2-q6",
      prompt: "Why must the last additions be dropwise?",
      options: [
        "To keep the burette clean",
        "To avoid passing the endpoint and overshooting the titre",
        "To make the indicator change colour faster",
        "To increase the acid concentration",
      ],
      answer: 1,
      explanation:
        "Near the endpoint a single drop can change the reading substantially. Dropwise addition lets you stop at the first persistent colour.",
    },
  ],
};
