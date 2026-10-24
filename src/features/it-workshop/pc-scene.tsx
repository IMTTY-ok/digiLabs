"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { PC_COMPONENT_BY_ID } from "@/features/it-workshop/content";

const PARTS: {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}[] = [
  { id: "motherboard", position: [0, 0, -0.4], size: [3.6, 2.4, 0.12], color: "#2a4a3a" },
  { id: "cpu", position: [-0.9, 0.5, -0.25], size: [0.55, 0.55, 0.12], color: "#b8860b" },
  { id: "cooler", position: [-0.9, 0.5, 0.35], size: [0.95, 0.95, 0.7], color: "#6b7280" },
  { id: "ram", position: [0.5, 0.55, -0.15], size: [0.18, 1.15, 0.35], color: "#177f8c" },
  { id: "gpu", position: [0.2, -0.6, 0.2], size: [2.4, 0.45, 0.8], color: "#1e5bc6" },
  { id: "psu", position: [0, -1.4, -0.1], size: [1.4, 0.8, 1.1], color: "#a9660f" },
  { id: "ssd", position: [-1.5, -0.9, -0.25], size: [0.12, 0.6, 0.25], color: "#5a6068" },
  { id: "case-fan", position: [1.6, 0.4, 0], size: [0.75, 0.75, 0.25], color: "#7c8a99" },
];

function explode(pos: [number, number, number], factor: number): [number, number, number] {
  return [pos[0] * factor, pos[1] * factor, pos[2] * factor + (pos[2] >= 0 ? 0.9 : -0.9) * (factor - 1)];
}

export interface PcSceneProps {
  exploded: boolean;
  selectedId: string | null;
  showLabels: boolean;
  onSelect: (id: string) => void;
}

export default function PcScene({ exploded, selectedId, showLabels, onSelect }: PcSceneProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 2.6, 6.2], fov: 42, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#0c1626"]} />
      <fog attach="fog" args={["#0c1626", 12, 28]} />

      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#c9d9ec", "#0e1a29", 0.5]} />
      <directionalLight position={[6, 10, 8]} intensity={1.4} color="#f2f6ff" />
      <directionalLight position={[-6, 4, -6]} intensity={0.4} color="#6f92bd" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#0f1a28" roughness={1} />
      </mesh>

      {/* Case frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 3.0, 1.8]} />
        <meshBasicMaterial color="#8fb3dd" wireframe transparent opacity={0.12} />
      </mesh>

      {PARTS.map((part) => {
        const selected = selectedId === part.id;
        const isHovered = hovered === part.id;
        const pos = exploded ? explode(part.position, 1.55) : part.position;
        const component = PC_COMPONENT_BY_ID[part.id];
        return (
          <group key={part.id} position={pos}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onSelect(part.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(part.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <boxGeometry args={part.size} />
              <meshStandardMaterial
                color={selected ? "#24364f" : isHovered ? "#1e3048" : part.color}
                roughness={0.7}
                metalness={0.12}
                emissive={selected ? part.color : "#000000"}
                emissiveIntensity={selected ? 0.22 : 0}
              />
            </mesh>
            {selected ? (
              <mesh scale={1.08}>
                <boxGeometry args={part.size} />
                <meshBasicMaterial color={part.color} wireframe transparent opacity={0.55} />
              </mesh>
            ) : null}

            {showLabels || selected ? (
              <Html
                center
                distanceFactor={10}
                position={[0, part.size[1] / 2 + 0.35, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="whitespace-nowrap rounded-sm border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] backdrop-blur-sm"
                  style={{
                    borderColor: selected ? part.color : "rgba(255,255,255,0.16)",
                    background: "rgba(11,20,33,0.82)",
                    color: selected ? "#f5f2ea" : "rgba(245,242,234,0.7)",
                  }}
                >
                  {component?.name ?? part.id}
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={14}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
