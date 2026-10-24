import type { LabId } from "@/types";

const BUILDINGS = [
  {
    id: "chemistry" as LabId,
    block: "A",
    code: "CHM-104",
    name: "Chemistry",
    x: 90,
    y: 190,
    w: 140,
    h: 100,
    accent: "#5b8ef0",
    center: [160, 240] as const,
    launch: false,
  },
  {
    id: "electronics" as LabId,
    block: "B",
    code: "ECE-102",
    name: "Electronics",
    x: 260,
    y: 106,
    w: 152,
    h: 122,
    accent: "#57b7c2",
    center: [336, 167] as const,
    launch: true,
  },
  {
    id: "it-workshop" as LabId,
    block: "C",
    code: "ITW-101",
    name: "IT Workshop",
    x: 452,
    y: 198,
    w: 122,
    h: 96,
    accent: "#dda04a",
    center: [513, 246] as const,
    launch: false,
  },
];

/**
 * A hand-drawn site plan used on the landing page and as the no-WebGL fallback.
 * It is intentionally schematic: a campus map, not a photograph.
 */
export function CampusPlan({
  activeId,
  idPrefix = "plan",
  className,
}: {
  activeId?: LabId | null;
  idPrefix?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 620 440"
      className={className}
      role="img"
      aria-label="Site plan of the Northline campus showing the Chemistry, Electronics and IT Workshop laboratory blocks connected by walkways to a central plaza."
    >
      <defs>
        <pattern id={`${idPrefix}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#7fa0c8" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <pattern id={`${idPrefix}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#0f1b2d" strokeOpacity="0.18" strokeWidth="1" />
        </pattern>
        <linearGradient id={`${idPrefix}-sky`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#13233a" />
          <stop offset="100%" stopColor="#0d1727" />
        </linearGradient>
        <filter id={`${idPrefix}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="620" height="440" rx="14" fill={`url(#${idPrefix}-sky)`} />
      <rect width="620" height="440" rx="14" fill={`url(#${idPrefix}-grid)`} />
      <rect x="0.5" y="0.5" width="619" height="439" rx="13.5" fill="none" stroke="#93b4d8" strokeOpacity="0.18" />

      {/* Lawns */}
      <g fill="#1d3b34" fillOpacity="0.75" stroke="#3b6458" strokeOpacity="0.5">
        <rect x="54" y="322" width="134" height="64" rx="7" />
        <rect x="452" y="72" width="126" height="74" rx="7" />
        <rect x="214" y="330" width="88" height="54" rx="7" />
      </g>
      {[74, 100, 126, 152, 168].map((x, i) => (
        <g key={`tree-a-${x}`} opacity="0.85">
          <circle cx={x} cy={344 + (i % 2) * 8} r="7" fill="#2f5a45" />
          <circle cx={x - 2} cy={342 + (i % 2) * 8} r="4" fill="#3e7357" />
        </g>
      ))}
      {[470, 500, 530, 556].map((x, i) => (
        <circle key={`tree-b-${x}`} cx={x} cy={96 + (i % 2) * 9} r="6.5" fill="#2f5a45" />
      ))}

      {/* Walkways */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M310 440V320" stroke="#273e5c" strokeWidth="30" />
        <path d="M310 320 200 272" stroke="#273e5c" strokeWidth="22" />
        <path d="M310 320 310 234" stroke="#273e5c" strokeWidth="22" />
        <path d="M310 320 448 288" stroke="#273e5c" strokeWidth="22" />
        <path d="M310 440V320" stroke="#8aa6c6" strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="5 8" />
        <path d="M310 320 200 272" stroke="#8aa6c6" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="4 8" />
        <path d="M310 320 310 234" stroke="#8aa6c6" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="4 8" />
        <path d="M310 320 448 288" stroke="#8aa6c6" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="4 8" />
      </g>

      {/* Plaza */}
      <circle cx="310" cy="313" r="30" fill="#1c3049" stroke="#4a688c" strokeOpacity="0.8" />
      <circle cx="310" cy="313" r="18" fill="none" stroke="#6c8eb6" strokeOpacity="0.5" strokeDasharray="3 5" />
      <circle cx="310" cy="313" r="4" fill="#c9d9ec" fillOpacity="0.8" />

      {BUILDINGS.map((building) => {
        const selected = activeId === building.id;
        return (
          <g key={building.id}>
            {/* extruded side */}
            <path
              d={`M${building.x + 12} ${building.y + 12} h${building.w} v${building.h} h-${building.w} z`}
              fill="#0a1422"
              stroke="#0a1422"
            />
            {/* footprint */}
            <rect
              x={building.x}
              y={building.y}
              width={building.w}
              height={building.h}
              rx="5"
              fill={selected ? `${building.accent}2e` : "#182a41"}
              stroke={building.accent}
              strokeOpacity={selected ? 0.95 : 0.6}
              strokeWidth={selected ? 2 : 1.2}
            />
            {/* roof hatch */}
            <rect
              x={building.x + 10}
              y={building.y + 10}
              width={building.w - 20}
              height={building.h - 20}
              rx="3"
              fill={`url(#${idPrefix}-hatch)`}
              opacity="0.55"
            />
            {/* roof service block */}
            <rect
              x={building.x + building.w / 2 - 16}
              y={building.y + building.h / 2 - 10}
              width="32"
              height="20"
              rx="2"
              fill="#20344f"
              stroke={building.accent}
              strokeOpacity="0.45"
            />
            {/* door */}
            <rect
              x={building.center[0] - 7}
              y={building.y + building.h - 5}
              width="14"
              height="5"
              rx="1"
              fill={building.accent}
              fillOpacity="0.85"
            />

            {/* marker */}
            <g>
              <circle cx={building.center[0]} cy={building.y + 18} r="12" fill={building.accent} fillOpacity="0.14" />
              <circle cx={building.center[0]} cy={building.y + 18} r="5" fill={building.accent} />
              {selected ? (
                <circle
                  cx={building.center[0]}
                  cy={building.y + 18}
                  r="11"
                  fill="none"
                  stroke={building.accent}
                  strokeOpacity="0.6"
                  strokeWidth="1.2"
                />
              ) : null}
            </g>

            <text
              x={building.x + 12}
              y={building.y + building.h - 18}
              fill="#e7eef8"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize="10"
              letterSpacing="1.6"
            >
              {building.name.toUpperCase()}
            </text>
            <text
              x={building.x + 12}
              y={building.y + building.h - 6}
              fill="#8aa4c2"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize="8"
              letterSpacing="1.2"
            >
              BLOCK {building.block} · {building.code}
            </text>

            {building.launch ? (
              <g filter={`url(#${idPrefix}-glow)`} opacity="0.7">
                <circle cx={building.center[0]} cy={building.y + 18} r="14" fill="none" stroke={building.accent} strokeOpacity="0.35" />
              </g>
            ) : null}
          </g>
        );
      })}

      {/* Entry */}
      <g>
        <path d="M286 432h48" stroke="#93b4d8" strokeOpacity="0.55" strokeWidth="1.2" />
        <text x="310" y="424" textAnchor="middle" fill="#8aa4c2" fontFamily="var(--font-plex-mono), monospace" fontSize="7.5" letterSpacing="1.5">
          MAIN ENTRY
        </text>
      </g>

      {/* Compass */}
      <g transform="translate(566 54)" stroke="#9db7d4" fill="none">
        <circle r="18" strokeOpacity="0.25" />
        <path d="M0 -12V14M-6 8 0 14 6 8" strokeOpacity="0.7" strokeWidth="1.2" />
        <text x="0" y="-23" textAnchor="middle" fill="#9db7d4" stroke="none" fontFamily="var(--font-plex-mono), monospace" fontSize="8" letterSpacing="1.5">
          N
        </text>
      </g>

      {/* Scale */}
      <g transform="translate(36 414)">
        <path d="M0 0h64M0 -4v8M32 -3v6M64 -4v8" stroke="#8aa4c2" strokeOpacity="0.7" strokeWidth="1" />
        <text x="0" y="14" fill="#8aa4c2" fontFamily="var(--font-plex-mono), monospace" fontSize="7.5" letterSpacing="1.2">
          0
        </text>
        <text x="28" y="14" fill="#8aa4c2" fontFamily="var(--font-plex-mono), monospace" fontSize="7.5" letterSpacing="1.2">
          10
        </text>
        <text x="57" y="14" fill="#8aa4c2" fontFamily="var(--font-plex-mono), monospace" fontSize="7.5" letterSpacing="1.2">
          20 m
        </text>
      </g>

      <text x="566" y="414" textAnchor="end" fill="#6f89a8" fontFamily="var(--font-plex-mono), monospace" fontSize="7.5" letterSpacing="1.1">
        NIE-014 · 18.52°N 73.85°E
      </text>
    </svg>
  );
}
