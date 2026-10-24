import type { ExperimentContent } from "@/features/experiments/content-types";

export const E1_CONTENT: ExperimentContent = {
  overview:
    "A regulated DC source drives two resistors in series. You will set the source voltage and resistor values, measure the current and the voltage across each resistor, and check that the algebraic sum of voltages around the loop is zero.",
  objectives: [
    "Apply Ohm's law to a series circuit.",
    "Measure voltage drops with a digital multimeter.",
    "State and verify Kirchhoff's voltage law for a closed loop.",
    "Explain how a single fault changes the measured distribution of voltage.",
    "Record readings and compare measured values with calculated values.",
  ],
  apparatus: [
    "Regulated DC power supply (0–12 V)",
    "Two resistors (nominally 220 Ω and 330 Ω)",
    "Breadboard",
    "Connecting leads",
    "Digital multimeter",
    "Ammeter in series with the loop",
  ],
  theory: [
    {
      heading: "Series current",
      paragraphs: [
        "In a series loop there is one path for charge, so the same current passes through every element. The total resistance is the sum of the individual resistances.",
        "The current follows directly from Ohm's law applied to the whole loop.",
      ],
      formula: "I = Vₛ / (R₁ + R₂)",
      formulaCaption: "The source voltage is shared across the resistors in proportion to their resistance.",
    },
    {
      heading: "Individual voltage drops",
      paragraphs: [
        "Each resistor drops a voltage equal to the current through it multiplied by its resistance. The larger resistor therefore drops the larger share of the source voltage.",
        "With the values in this simulation (220 Ω and 330 Ω at 6 V), the drops are 2.4 V and 3.6 V.",
      ],
      formula: "V₁ = I × R₁    V₂ = I × R₂",
    },
    {
      heading: "Kirchhoff's voltage law",
      paragraphs: [
        "Around any closed loop, the algebraic sum of all potential differences is zero. Taking the source as positive and the drops as negative:",
        "The residual in the simulation is zero within floating-point arithmetic. In a real experiment, meter resolution and resistor tolerance produce a small non-zero residual, which should be reported honestly.",
      ],
      formula: "Vₛ − V₁ − V₂ = 0",
    },
    {
      heading: "Fault behaviour",
      paragraphs: [
        "If R₂ is open, no current flows and the full source voltage appears across the break; R₁ drops 0 V. The loop law still holds algebraically.",
        "If R₁ is shorted, its resistance is effectively zero, the current rises, and the full source voltage appears across R₂. This is a useful reminder to switch off the supply before changing connections.",
      ],
    },
  ],
  procedure: [
    {
      title: "Inspect the bench",
      detail:
        "Confirm the supply is off and the leads are undamaged. Set the supply current limit to a low value before energising.",
    },
    {
      title: "Build the series loop",
      detail:
        "Connect R₁ and R₂ in series with the supply. Insert the ammeter in series so that the loop current passes through it.",
    },
    {
      title: "Set the source",
      detail: "Set the source voltage to 6.0 V and switch on. Confirm the ammeter reads a sensible current.",
    },
    {
      title: "Measure the drops",
      detail:
        "Measure V₁ across R₁ and V₂ across R₂ with the voltmeter in parallel. Record each value to three decimal places.",
    },
    {
      title: "Check the loop",
      detail: "Add the two drops and compare with the source voltage. Record the residual, Vₛ − V₁ − V₂.",
    },
    {
      title: "Change one variable at a time",
      detail:
        "Repeat for a second source voltage and for a different resistance pair, keeping all other conditions unchanged.",
    },
    {
      title: "Inject a fault (simulated)",
      detail:
        "Select an open or short fault, observe the readings, and explain the result before resetting the circuit.",
    },
  ],
  precautions: [
    "Switch off the supply before changing any connection.",
    "Check the meter range and mode before measuring.",
    "Do not exceed the resistor power rating; a small resistor can overheat.",
    "Keep the source voltage low for this exercise; the prototype is low-voltage by design.",
    "Do not create a short circuit across the supply terminals.",
    "Report damaged leads or a warm component immediately.",
  ],
  safety: [
    "All electrical work here is simulated at low voltage. Physical work must be supervised.",
    "Verify instrument settings before energising a real circuit.",
    "Observe component ratings; resistors have a power limit, P = I²R.",
    "Use one hand where practical and avoid contact with energised conductors.",
    "Switch off and acknowledge shutdown when a session ends.",
  ],
  practice: [
    {
      question: "A 9 V source is connected across 470 Ω and 220 Ω in series. Find the current and the voltage across each resistor.",
      answer:
        "R_total = 690 Ω; I = 9 / 690 = 13.04 mA; V(470) = 6.13 V; V(220) = 2.87 V. Their sum is 9.00 V within rounding.",
    },
    {
      question: "An open circuit makes the ammeter read zero. What would an ideal voltmeter read across the open element?",
      answer: "The full source voltage, because no current flows and there is no drop across the other elements.",
    },
  ],
  quiz: [
    {
      id: "e1-q1",
      prompt: "Kirchhoff's voltage law states that, around a closed loop, the algebraic sum of voltages is:",
      options: ["Equal to the supply voltage", "Zero", "Always positive", "Equal to the current"],
      answer: 1,
      explanation:
        "ΣV = 0 around any closed loop. The source rise and the resistive drops cancel algebraically.",
    },
    {
      id: "e1-q2",
      prompt: "Two resistors in series carry:",
      options: ["Different currents", "The same current", "A current inversely proportional to the voltage", "Zero current"],
      answer: 1,
      explanation: "There is only one path for charge in a series loop, so the same current flows through each element.",
    },
    {
      id: "e1-q3",
      prompt: "For Vₛ = 6 V, R₁ = 220 Ω and R₂ = 330 Ω, the current is approximately:",
      options: ["10.91 mA", "18.18 mA", "27.27 mA", "109.1 mA"],
      answer: 0,
      explanation: "I = 6 / (220 + 330) = 6 / 550 = 10.91 mA.",
    },
    {
      id: "e1-q4",
      prompt: "In that circuit, which resistor has the larger voltage drop?",
      options: ["R₁, because it is first", "R₂, because its resistance is larger", "Both are equal", "Neither; both are zero"],
      answer: 1,
      explanation: "V = IR and the current is common, so the larger resistance drops the larger voltage: V₂ = 3.6 V versus V₁ = 2.4 V.",
    },
    {
      id: "e1-q5",
      prompt: "If R₂ becomes open while the supply stays on, the current becomes:",
      options: ["Larger", "Zero", "Unchanged", "Infinite"],
      answer: 1,
      explanation: "An open branch breaks the only path, so no current flows. An ideal voltmeter across the break reads the source voltage.",
    },
    {
      id: "e1-q6",
      prompt: "Why should the supply be switched off before changing connections?",
      options: [
        "To protect the resistor colour bands",
        "To prevent shock and accidental short circuits",
        "To make the meter read faster",
        "To increase the resistance",
      ],
      answer: 1,
      explanation: "De-energising before rewiring prevents shock, arcing and accidental short circuits.",
    },
  ],
};

export const E2_CONTENT: ExperimentContent = {
  overview:
    "A regulated DC source feeds two parallel resistors through a common junction. You will measure the branch currents and the total current, then verify that the current entering the junction equals the total current leaving it.",
  objectives: [
    "Apply Ohm's law to parallel branches.",
    "Measure branch currents with an ammeter in series with each branch.",
    "State and verify Kirchhoff's current law at a junction.",
    "Explain current division and how resistance changes the sharing.",
    "Interpret an open-branch fault correctly.",
  ],
  apparatus: [
    "Regulated DC power supply (0–12 V)",
    "Two resistors (nominally 220 Ω and 470 Ω)",
    "Breadboard",
    "Connecting leads",
    "Digital ammeter or multimeter",
    "Junction node and branch leads",
  ],
  theory: [
    {
      heading: "Parallel branches",
      paragraphs: [
        "In a parallel connection, both resistors see the same source voltage. Each branch current is set by its own resistance.",
        "The total current supplied by the source is the sum of the branch currents.",
      ],
      formula: "I₁ = V / R₁    I₂ = V / R₂    I_total = I₁ + I₂",
    },
    {
      heading: "Kirchhoff's current law",
      paragraphs: [
        "Charge does not accumulate at an ideal junction. The current entering the node must equal the sum of the currents leaving it.",
        "At the supply-side junction the source current enters and the two branch currents leave. The balance is zero when the meter readings are consistent.",
      ],
      formula: "ΣI_in = ΣI_out",
    },
    {
      heading: "Current division",
      paragraphs: [
        "For a fixed source voltage, the smaller resistance carries the larger current. Making one branch open forces all the current through the other branch, and the total falls.",
        "The equivalent resistance of two parallel resistors is less than either individual resistance.",
      ],
      formula: "1/R_eq = 1/R₁ + 1/R₂",
    },
  ],
  procedure: [
    {
      title: "Set up safely",
      detail: "Confirm the supply is off. Build the two parallel branches and identify the supply-side junction clearly.",
    },
    {
      title: "Insert the ammeter",
      detail:
        "Break the circuit at the chosen measurement point and insert the ammeter in series. Never connect an ammeter in parallel with the supply.",
    },
    {
      title: "Energise and measure",
      detail: "Set the source to 6.0 V, switch on, and record I₁, I₂ and the total current.",
    },
    {
      title: "Check the junction",
      detail: "Compare total current with I₁ + I₂ and record the residual. It should be zero within meter resolution.",
    },
    {
      title: "Vary the resistances",
      detail: "Change R₁ and record again. Confirm that the smaller resistance takes the larger share of current.",
    },
    {
      title: "Open a branch",
      detail: "Select the open-branch fault and observe the change. Explain why the total current falls but the junction balance remains zero.",
    },
  ],
  precautions: [
    "Always break the circuit before inserting an ammeter.",
    "Never connect an ammeter across a voltage source.",
    "Switch off before changing resistor values or leads.",
    "Check that branch leads cannot touch and create an unintended short.",
    "Use a supply current limit appropriate to the resistors.",
    "Record meter ranges so readings can be interpreted correctly.",
  ],
  safety: [
    "The simulation is low-voltage; physical work requires supervision and inspected leads.",
    "Check instrument range and mode before energising.",
    "Observe component power ratings.",
    "Avoid short circuits and never work on an energised circuit.",
    "Acknowledge the power-off reminder at the end of a session.",
  ],
  practice: [
    {
      question: "A 6 V source feeds 220 Ω and 470 Ω in parallel. Find I₁, I₂ and the total current.",
      answer: "I₁ = 6/220 = 27.27 mA; I₂ = 6/470 = 12.77 mA; total = 40.04 mA.",
    },
    {
      question: "The 220 Ω branch is opened. What happens to the total current?",
      answer: "The total falls to the 470 Ω branch current, about 12.77 mA, because that branch now carries all the current.",
    },
  ],
  quiz: [
    {
      id: "e2-q1",
      prompt: "Kirchhoff's current law says that at a node:",
      options: ["Voltages sum to zero", "Current entering equals current leaving", "Resistance is constant", "Current is always zero"],
      answer: 1,
      explanation: "Charge conservation at a junction gives ΣI_in = ΣI_out.",
    },
    {
      id: "e2-q2",
      prompt: "Two parallel resistors have the same:",
      options: ["Current", "Voltage across them", "Resistance", "Power"],
      answer: 1,
      explanation: "Parallel branches are connected across the same two nodes, so they share the same voltage.",
    },
    {
      id: "e2-q3",
      prompt: "With 6 V across 220 Ω and 470 Ω in parallel, the total current is about:",
      options: ["12.77 mA", "27.27 mA", "40.04 mA", "52.31 mA"],
      answer: 2,
      explanation: "I_total = 6/220 + 6/470 = 27.27 + 12.77 = 40.04 mA.",
    },
    {
      id: "e2-q4",
      prompt: "Which branch carries the larger current?",
      options: ["The 470 Ω branch", "The 220 Ω branch", "Both the same", "Neither carries current"],
      answer: 1,
      explanation: "For the same voltage, I = V/R, so the smaller resistance (220 Ω) carries the larger current.",
    },
    {
      id: "e2-q5",
      prompt: "If one branch opens, the total source current:",
      options: ["Increases", "Decreases to the remaining branch current", "Becomes zero", "Stays exactly the same"],
      answer: 1,
      explanation: "The open branch carries no current, so the source supplies only the remaining branch.",
    },
    {
      id: "e2-q6",
      prompt: "An ammeter must be connected:",
      options: ["In parallel with the branch", "In series with the branch", "Across the supply", "To the earth terminal only"],
      answer: 1,
      explanation:
        "An ammeter has very low resistance and must carry the current it measures, so it is connected in series. Connecting it across a supply can cause a short circuit.",
    },
  ],
};
