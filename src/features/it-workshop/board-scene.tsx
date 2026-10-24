"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { BOARD_HOTSPOTS } from "@/features/it-workshop/content";

export interface BoardSceneProps {
  selectedId: string | null;
  hideLabels: boolean;
  onSelect: (id: string) => void;
}

export default function BoardScene({ selectedId, hideLabels, onSelect }: BoardSceneProps) {
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
      camera={{ position: [0, 0, 7], fov: 42, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#0c1626"]} />
      <fog attach="fog" args={["#0c1626", 14, 26]} />

      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#c9d9ec", "#0e1a29", 0.5]} />
      <directionalLight position={[6, 8, 10]} intensity={1.4} color="#f2f6ff" />
      <directionalLight position={[-6, 2, -6]} intensity={0.35} color="#6f92bd" />

      {/* Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 4.2, 0.12]} />
        <meshStandardMaterial color="#1f3b33" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0, 0.065]} scale={[1.001, 1.001, 1]}>
        <boxGeometry args={[6, 4.2, 0.01]} />
        <meshBasicMaterial color="#2f6d4f" wireframe transparent opacity={0.18} />
      </mesh>

      {BOARD_HOTSPOTS.map((hotspot) => {
        const selected = selectedId === hotspot.id;
        const isHovered = hovered === hotspot.id;
        const pos = hotspot.position;
        return (
          <group key={hotspot.id} position={[pos[0], pos[1], 0.16]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onSelect(hotspot.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(hotspot.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.16, 24, 24]} />
              <meshStandardMaterial
                color={selected ? hotspot.accent : isHovered ? hotspot.accent : "#c9d9ec"}
                emissive={hotspot.accent}
                emissiveIntensity={selected ? 0.6 : isHovered ? 0.35 : 0.12}
                roughness={0.4}
              />
            </mesh>
            {selected ? (
              <mesh scale={1.6}>
                <sphereGeometry args={[0.16, 24, 24]} />
                <meshBasicMaterial color={hotspot.accent} transparent opacity={0.22} />
              </mesh>
            ) : null}

            {!hideLabels ? (
              <Html
                center
                distanceFactor={9}
                position={[0, 0.32, 0]}
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="whitespace-nowrap rounded-sm border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] backdrop-blur-sm"
                  style={{
                    borderColor: selected ? hotspot.accent : "rgba(255,255,255,0.14)",
                    background: "rgba(11,20,33,0.82)",
                    color: selected ? "#f5f2ea" : "rgba(245,242,234,0.65)",
                  }}
                >
                  {hotspot.name}
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
        maxDistance={12}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
