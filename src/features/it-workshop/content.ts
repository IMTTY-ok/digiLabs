import type { ExperimentContent } from "@/features/experiments/content-types";

export interface PcComponent {
  id: string;
  name: string;
  category: string;
  short: string;
  description: string;
  role: string;
  handling: string;
  accent: string;
}

export const PC_COMPONENTS: PcComponent[] = [
  {
    id: "motherboard",
    name: "Motherboard",
    category: "Interconnect",
    short: "The board that connects every subsystem.",
    description:
      "A multi-layer printed circuit board carrying the CPU socket, memory slots, expansion slots, power delivery and rear I/O. Traces route signals and power between components.",
    role:
      "Provides the physical and electrical platform for the CPU, RAM, storage and expansion cards, and carries the chipset that coordinates their communication.",
    handling:
      "Support the board by its edges. Avoid flexing it, and never touch the socket contacts or gold edge connectors.",
    accent: "#2f6d4f",
  },
  {
    id: "cpu",
    name: "CPU",
    category: "Processing",
    short: "Executes instructions and coordinates the system.",
    description:
      "The central processing unit contains cores, cache and a memory controller. It sits in the CPU socket and is held by a retention lever.",
    role:
      "Fetches, decodes and executes instructions; performs arithmetic and logic; moves data between cache, memory and devices.",
    handling:
      "Hold by the edges, never touch the contact pads or pins, and align the triangle marker with the socket before lowering the lever.",
    accent: "#b8860b",
  },
  {
    id: "cooler",
    name: "CPU cooler",
    category: "Thermal",
    short: "Moves heat away from the processor.",
    description:
      "A heatsink with heat pipes and a fan, mounted over the CPU with thermal paste between the surfaces to improve heat transfer.",
    role:
      "Conducts heat from the CPU into fins, where airflow carries it into the case. Without it, the CPU would throttle or shut down.",
    handling:
      "Tighten mounting screws in a diagonal pattern and use only a small amount of thermal paste.",
    accent: "#6b7280",
  },
  {
    id: "ram",
    name: "RAM (DIMM)",
    category: "Memory",
    short: "Volatile working memory for active programs.",
    description:
      "Memory modules installed in DIMM slots. Each module is a small circuit board with memory chips and a gold edge connector, keyed so it can only be inserted one way.",
    role:
      "Stores the operating system, running programs and working data for the CPU. Contents are lost when power is removed.",
    handling:
      "Release both slot clips, align the notch, and press firmly and evenly until the clips snap closed.",
    accent: "#177f8c",
  },
  {
    id: "gpu",
    name: "Graphics card",
    category: "Expansion",
    short: "Renders images and drives displays.",
    description:
      "An expansion card with its own processor, memory and cooling, seated in a PCIe x16 slot and secured to the case bracket.",
    role:
      "Processes graphical workloads and provides display outputs. Also used for parallel compute in some workloads.",
    handling:
      "Support the card while releasing the PCIe latch; do not bend it or touch the edge connector.",
    accent: "#1e5bc6",
  },
  {
    id: "psu",
    name: "Power supply unit",
    category: "Power",
    short: "Converts mains AC into regulated DC rails.",
    description:
      "A switched-mode power supply that produces +12 V, +5 V and +3.3 V rails. Modular cables distribute power to the board and drives.",
    role:
      "Supplies stable DC power to every component. Capacity must exceed the system's peak load with sensible headroom.",
    handling:
      "Never open a PSU — stored charge can be lethal. Match cable types and do not force a connector.",
    accent: "#a9660f",
  },
  {
    id: "ssd",
    name: "SSD",
    category: "Storage",
    short: "Non-volatile storage for the operating system and files.",
    description:
      "A solid-state drive using flash memory. It may connect through SATA or an M.2 slot directly on the motherboard.",
    role:
      "Retains data without power and provides fast random access compared with a mechanical hard disk.",
    handling:
      "Handle by the edges and avoid static discharge. Secure the M.2 screw before closing the system.",
    accent: "#5a6068",
  },
  {
    id: "case-fan",
    name: "Case fan",
    category: "Thermal",
    short: "Maintains airflow through the chassis.",
    description:
      "A fan mounted at the front, rear or top of the case. Intake and exhaust fans are oriented to create a directed airflow path.",
    role:
      "Brings cool air in and removes heated air, reducing ambient temperature inside the case.",
    handling:
      "Check the airflow arrow before mounting and route fan cables clear of moving blades.",
    accent: "#7c8a99",
  },
];

export const PC_COMPONENT_BY_ID = Object.fromEntries(
  PC_COMPONENTS.map((component) => [component.id, component]),
) as Record<string, PcComponent>;

export interface BoardHotspot {
  id: string;
  name: string;
  location: string;
  description: string;
  function: string;
  interacts: string;
  position: [number, number, number];
  accent: string;
}

export const BOARD_HOTSPOTS: BoardHotspot[] = [
  {
    id: "cpu-socket",
    name: "CPU socket",
    location: "Upper-left quadrant",
    description:
      "A land-grid array socket with a retention frame and lever. The CPU is placed inside the frame and clamped down.",
    function:
      "Makes hundreds of electrical contacts between the processor and the motherboard's power and signal traces.",
    interacts: "CPU, CPU cooler, VRM, memory controller, chipset",
    position: [-1.55, 0.55, 0.22],
    accent: "#b8860b",
  },
  {
    id: "dimm-slots",
    name: "DIMM slots",
    location: "Right of the CPU socket",
    description:
      "Two or four long slots with retaining clips, keyed to accept DDR memory modules.",
    function:
      "Connect memory modules directly to the CPU memory controller through short, high-speed traces.",
    interacts: "CPU memory controller, power delivery",
    position: [1.45, 0.62, 0.2],
    accent: "#177f8c",
  },
  {
    id: "atx-24pin",
    name: "24-pin ATX power connector",
    location: "Right edge, middle",
    description:
      "A 24-pin header that receives the main power cable from the power supply.",
    function:
      "Distributes +12 V, +5 V, +3.3 V and standby power to the board and its subsystems.",
    interacts: "PSU, VRM, chipset, expansion slots, storage",
    position: [2.55, 0.05, 0.2],
    accent: "#a9660f",
  },
  {
    id: "cpu-power",
    name: "CPU power connector",
    location: "Top edge near the CPU",
    description: "An 8-pin (or 4+4) header dedicated to CPU power delivery.",
    function:
      "Supplies the high-current 12 V feed that the VRM converts for the processor.",
    interacts: "PSU, VRM, CPU",
    position: [1.1, 1.72, 0.2],
    accent: "#a9660f",
  },
  {
    id: "pcie-x16",
    name: "PCIe x16 slot",
    location: "Lower-left, below the CPU area",
    description:
      "A long expansion slot with a retention latch, typically the primary slot for a graphics card.",
    function:
      "Provides high-bandwidth lanes between the CPU and expansion devices such as a GPU.",
    interacts: "CPU, chipset, GPU",
    position: [-0.55, -0.85, 0.22],
    accent: "#1e5bc6",
  },
  {
    id: "cmos-battery",
    name: "CMOS battery",
    location: "Lower centre",
    description:
      "A coin cell in a holder, usually CR2032, that keeps the real-time clock and firmware settings alive.",
    function:
      "Maintains basic input/output settings and system time when the main power is disconnected.",
    interacts: "Chipset, firmware (BIOS/UEFI)",
    position: [0.35, -1.25, 0.25],
    accent: "#8b8f94",
  },
  {
    id: "sata-ports",
    name: "SATA ports",
    location: "Right edge, lower",
    description:
      "L-shaped data connectors, often grouped in pairs and angled for cable routing.",
    function: "Carry data between the chipset and SATA storage devices at up to 6 Gb/s.",
    interacts: "Chipset, HDD/SSD, optical drives",
    position: [2.5, -1.05, 0.2],
    accent: "#5a6068",
  },
  {
    id: "m2-slot",
    name: "M.2 storage slot",
    location: "Between the PCIe slots",
    description:
      "A short, keyed slot with a mounting screw for an M.2 SSD, which lies flat against the board.",
    function:
      "Provides PCIe or SATA connectivity directly to a compact solid-state drive.",
    interacts: "Chipset or CPU PCIe lanes, SSD",
    position: [0.65, -0.55, 0.2],
    accent: "#177f8c",
  },
  {
    id: "vrm-heatsink",
    name: "VRM and heatsink",
    location: "Above and left of the CPU socket",
    description:
      "Voltage regulator modules with inductors and MOSFETs, often covered by finned aluminium heatsinks.",
    function:
      "Converts the 12 V supply into the low, stable voltage the CPU requires at high current.",
    interacts: "CPU power connector, CPU socket",
    position: [-1.65, 1.35, 0.2],
    accent: "#6b7280",
  },
  {
    id: "rear-io",
    name: "Rear I/O panel",
    location: "Left edge",
    description:
      "A cluster of ports on the board edge: USB, display outputs, audio jacks, Ethernet and sometimes antenna connectors.",
    function:
      "Connects external peripherals and networks to the system without opening the case.",
    interacts: "Chipset, CPU, audio codec, network controller",
    position: [-2.7, 0.45, 0.2],
    accent: "#2f6d4f",
  },
  {
    id: "chipset",
    name: "Chipset region",
    location: "Lower-right",
    description:
      "A silicon package under a heatsink that handles I/O fan-out and some storage and USB lanes.",
    function:
      "Coordinates communication between the CPU and lower-speed peripherals, and manages additional PCIe/SATA/USB ports.",
    interacts: "CPU, SATA, USB, PCIe, networking",
    position: [1.75, -1.55, 0.2],
    accent: "#6b7280",
  },
];

export const I1_CONTENT: ExperimentContent = {
  overview:
    "Open the training system, inspect each major component in 3D, and connect each part to its function. The exploded view separates the assemblies so their relative positions are easier to see.",
  objectives: [
    "Recognise the principal components inside a desktop computer.",
    "Describe the function of the CPU, memory, storage, power supply and cooling.",
    "Explain how the motherboard connects the subsystems.",
    "Follow safe handling practice for exposed components.",
    "Identify components from their visual form and position.",
  ],
  apparatus: [
    "Training desktop system with removable side panel",
    "Motherboard and CPU",
    "DDR memory modules",
    "SATA or M.2 SSD",
    "Power supply unit",
    "CPU cooler and case fans",
    "Monitor and peripherals",
    "Anti-static wrist strap and mat",
  ],
  theory: [
    {
      heading: "The processing path",
      paragraphs: [
        "The CPU executes instructions and coordinates the system. It reads program data from RAM, performs operations in its registers and cache, and writes results back.",
        "RAM is fast but volatile: it holds only what is currently in use and loses its contents when power is removed.",
      ],
    },
    {
      heading: "Storage and power",
      paragraphs: [
        "Non-volatile storage such as an SSD keeps the operating system and files across power cycles. Capacity and speed matter, but so does the interface: SATA and NVMe M.2 drives connect differently.",
        "The power supply converts mains AC into regulated DC rails. It must supply enough power for peak load, and every connector must match its header without force.",
      ],
    },
    {
      heading: "Thermal management",
      paragraphs: [
        "Heat is the practical limit on sustained performance. The CPU cooler conducts heat into a heatsink, and case fans move air through the chassis.",
        "Thermal paste fills microscopic gaps between the CPU and cooler base. Too much is as unhelpful as too little.",
      ],
    },
    {
      heading: "Handling and ESD",
      paragraphs: [
        "Static discharge can destroy integrated circuits without any visible sign. Work on a grounded anti-static mat with a wrist strap connected.",
        "Hold boards and cards by their edges, keep contacts clean, and never force a keyed connector.",
      ],
    },
  ],
  procedure: [
    { title: "Prepare the bench", detail: "Power down, disconnect mains, and ground yourself with an anti-static strap." },
    { title: "Remove the side panel", detail: "Identify the case airflow path and the main cable runs before touching components." },
    { title: "Inspect the board", detail: "Locate the CPU socket, DIMM slots, PCIe slots and power headers without removing anything." },
    { title: "Select each component", detail: "In the 3D model, select a component or choose it from the accessible list. Read its function and handling note." },
    { title: "Switch to exploded view", detail: "Separate the assemblies and trace how power and data connect them." },
    { title: "Test yourself", detail: "Hide the labels and identify each highlighted part before attempting the quiz." },
  ],
  precautions: [
    "Disconnect mains power before opening a system.",
    "Wear an anti-static strap connected to a suitable ground point.",
    "Hold components by their edges; do not touch contacts or pins.",
    "Never force a connector; check the keying first.",
    "Keep liquids away from the workbench.",
    "Do not open a power supply enclosure.",
  ],
  safety: [
    "Unplug the system before any hardware work.",
    "Use ESD protection; static damage may not be immediately visible.",
    "Protect exposed contacts and store components in anti-static bags.",
    "Follow instructor instructions and do not improvise with unfamiliar hardware.",
    "The 3D model is instructional, not an engineering-grade mechanical drawing.",
  ],
  practice: [
    {
      question: "A system powers on but shows no display. Which components would you check first?",
      answer:
        "Check the monitor input and cable, then the GPU seating and its PCIe power, RAM seating, and the CPU power connector. Keep the system off while reseating components.",
    },
    {
      question: "Why is RAM described as volatile?",
      answer: "Its contents require power; they are lost when the system is switched off, unlike SSD or HDD storage.",
    },
  ],
  quiz: [
    {
      id: "i1-q1",
      prompt: "Which component executes program instructions?",
      options: ["PSU", "CPU", "SSD", "Case fan"],
      answer: 1,
      explanation: "The CPU fetches, decodes and executes instructions; other components support it.",
    },
    {
      id: "i1-q2",
      prompt: "RAM is best described as:",
      options: ["Permanent storage", "Volatile working memory", "A power converter", "A cooling device"],
      answer: 1,
      explanation: "RAM holds active data for the CPU and loses its contents when power is removed.",
    },
    {
      id: "i1-q3",
      prompt: "The power supply unit converts:",
      options: ["DC to AC", "AC mains to regulated DC rails", "Data to power", "Heat to electricity"],
      answer: 1,
      explanation: "A PSU converts mains AC into +12 V, +5 V and +3.3 V DC rails.",
    },
    {
      id: "i1-q4",
      prompt: "What is the purpose of thermal paste?",
      options: [
        "To glue the cooler permanently",
        "To improve heat transfer by filling microscopic gaps",
        "To conduct electricity to the CPU",
        "To clean the CPU surface",
      ],
      answer: 1,
      explanation:
        "Thermal paste displaces air in tiny surface imperfections, improving conduction between the CPU and cooler base.",
    },
    {
      id: "i1-q5",
      prompt: "Which practice best protects components from electrostatic discharge?",
      options: [
        "Working on a carpet in socks",
        "Touching the CPU pins first",
        "Using a grounded anti-static wrist strap and mat",
        "Holding cards by their gold contacts",
      ],
      answer: 2,
      explanation:
        "A grounded strap and mat safely equalise potential. Touching pins or contacts risks both ESD and mechanical damage.",
    },
  ],
};

export const I2_CONTENT: ExperimentContent = {
  overview:
    "Inspect a representative motherboard in 3D. Each hotspot is attached to a real part of the model: select it to highlight the component, read its purpose and see how it connects to the rest of the system.",
  objectives: [
    "Identify the CPU socket, memory slots and expansion slots.",
    "Locate the main power and CPU power connectors.",
    "Recognise storage interfaces and the CMOS battery.",
    "Describe how the VRM, chipset and rear I/O support the CPU.",
    "Use component names accurately when discussing a system.",
  ],
  apparatus: [
    "Representative ATX motherboard",
    "Compatible CPU",
    "DDR memory module",
    "SATA or M.2 storage device",
    "Anti-static wrist strap and mat",
    "Component reference manual",
  ],
  theory: [
    {
      heading: "A city plan for signals",
      paragraphs: [
        "The motherboard is a layered circuit board. Short, direct traces connect the CPU to memory; the chipset fans out slower I/O such as USB, SATA and additional PCIe lanes.",
        "Power arrives through the 24-pin connector and the dedicated CPU power header, then the VRM converts it to the low voltage the processor needs.",
      ],
    },
    {
      heading: "Sockets and slots",
      paragraphs: [
        "The CPU socket is keyed and delicate. DIMM slots are similarly keyed and must be filled in the order recommended by the board manual to use the correct memory channels.",
        "PCIe x16 slots usually serve graphics cards; shorter x1 or x4 slots take network, audio or storage cards.",
      ],
    },
    {
      heading: "Persistent settings",
      paragraphs: [
        "The CMOS coin cell keeps the real-time clock and firmware settings alive when mains power is removed. Replacing it resets those settings.",
        "Firmware stored in flash memory initialises the hardware before the operating system starts.",
      ],
    },
  ],
  procedure: [
    { title: "Ground yourself", detail: "Connect an anti-static strap before touching the board or its components." },
    { title: "Survey the board", detail: "Rotate the model and identify the major regions: CPU, memory, power, expansion and I/O." },
    { title: "Select a hotspot", detail: "Click a highlighted marker or choose the component from the accessible list. Read its name, location and function." },
    { title: "Trace the interaction", detail: "Use the interaction note to see which other components depend on the selected part." },
    { title: "Hide the labels", detail: "Use self-test mode to hide labels, then identify components from their position and shape." },
    { title: "Isolate and inspect", detail: "Isolate a component to view it without distractions, then restore the full board." },
  ],
  precautions: [
    "Never touch socket pins or the CPU contact pads.",
    "Support the board by its edges and avoid flexing it.",
    "Confirm connector keying before applying any force.",
    "Keep the board on an anti-static surface.",
    "Do not install or remove components with power connected.",
    "Refer to the specific board manual; layouts differ between models.",
  ],
  safety: [
    "Disconnect power before working inside a system.",
    "Use ESD protection and avoid touching exposed contacts.",
    "Do not force connectors or retention mechanisms.",
    "Follow instructor guidance for any physical hardware session.",
    "This model is representative and simplified, not a service manual.",
  ],
  practice: [
    {
      question: "A new graphics card is not detected. Which slot and connection would you check?",
      answer:
        "Confirm the card is fully seated in the primary PCIe x16 slot, its latch is closed, any PCIe power connectors are attached, and the monitor is connected to the card rather than the motherboard.",
    },
    {
      question: "What happens if the CMOS battery is removed?",
      answer:
        "The real-time clock and stored firmware settings may reset to defaults; the system can still boot after reconfiguration.",
    },
  ],
  quiz: [
    {
      id: "i2-q1",
      prompt: "The CPU is installed in the:",
      options: ["DIMM slot", "PCIe x16 slot", "CPU socket", "SATA port"],
      answer: 2,
      explanation: "The CPU sits in the keyed CPU socket and is secured by a retention mechanism.",
    },
    {
      id: "i2-q2",
      prompt: "Memory modules are installed in:",
      options: ["DIMM slots", "M.2 slots", "PCIe slots", "SATA ports"],
      answer: 0,
      explanation: "DIMM slots accept DDR memory modules and connect them to the CPU memory controller.",
    },
    {
      id: "i2-q3",
      prompt: "The 24-pin ATX connector mainly:",
      options: [
        "Carries display signals",
        "Distributes power from the PSU to the board",
        "Connects SATA drives",
        "Holds the CMOS battery",
      ],
      answer: 1,
      explanation: "The 24-pin header receives the main PSU cable and distributes the DC rails.",
    },
    {
      id: "i2-q4",
      prompt: "A graphics card is normally fitted in which slot?",
      options: ["DIMM slot", "PCIe x16 slot", "M.2 slot", "CPU socket"],
      answer: 1,
      explanation: "PCIe x16 provides the bandwidth and mechanical support typically used by a GPU.",
    },
    {
      id: "i2-q5",
      prompt: "The CMOS battery is used to:",
      options: [
        "Power the CPU during heavy load",
        "Keep the real-time clock and firmware settings alive",
        "Store the operating system",
        "Cool the chipset",
      ],
      answer: 1,
      explanation: "The coin cell maintains the clock and firmware settings when mains power is off.",
    },
    {
      id: "i2-q6",
      prompt: "Which region converts 12 V into the low voltage used by the CPU?",
      options: ["Rear I/O", "VRM", "SATA controller", "CMOS"],
      answer: 1,
      explanation: "Voltage regulator modules (VRM) step down and regulate the CPU supply.",
    },
  ],
};
