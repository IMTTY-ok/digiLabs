"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { ACCENT_HEX, CAMPUS_DESTINATIONS, CAMPUS_OVERVIEW } from "@/lib/data/labs";
import type { CampusDestination, LabId } from "@/types";

type Vec3 = [number, number, number];

const BUILDING_DEPTH = 9;
const BUILDING_WIDTH = 10;
const BUILDING_HEIGHT = 7.6;
const BUILDING_Z_OFFSET = -11;
const PLAZA: Vec3 = [0, 0.04, 4];

function CameraRig({
  position,
  target,
  animate,
  presetKey,
}: {
  position: Vec3;
  target: Vec3;
  animate: boolean;
  presetKey: string;
}) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as
    | { target: THREE.Vector3; update: () => void }
    | null;

  const desiredPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const desiredTarget = useMemo(() => new THREE.Vector3(...target), [target]);
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;
    if (!animate) {
      camera.position.copy(desiredPosition);
      if (controls) {
        controls.target.copy(desiredTarget);
        controls.update();
      }
      settled.current = true;
    }
  }, [animate, camera, controls, desiredPosition, desiredTarget, presetKey]);

  useFrame((_, delta) => {
    if (!animate || settled.current) return;
    const ease = 1 - Math.exp(-7 * Math.min(delta, 0.08) * 10);
    camera.position.lerp(desiredPosition, Math.min(1, ease));
    if (controls) {
      controls.target.lerp(desiredTarget, Math.min(1, ease));
      controls.update();
    }
    if (
      camera.position.distanceTo(desiredPosition) < 0.04 &&
      (!controls || controls.target.distanceTo(desiredTarget) < 0.04)
    ) {
      camera.position.copy(desiredPosition);
      if (controls) {
        controls.target.copy(desiredTarget);
        controls.update();
      }
      settled.current = true;
    }
  });

  return null;
}

function WindowStrip({ accent, y }: { accent: string; y: number }) {
  return (
    <group position={[0, y, BUILDING_DEPTH / 2 + 0.03]}>
      {[-3.2, -1.1, 1.1, 3.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <planeGeometry args={[1.15, 0.72]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.35}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Block({
  destination,
  selected,
  activeSession,
  onSelect,
  portal,
}: {
  destination: CampusDestination;
  selected: boolean;
  activeSession: boolean;
  onSelect: (id: LabId) => void;
  portal?: any;
}) {
  const [hovered, setHovered] = useState(false);
  const accent = ACCENT_HEX[destination.accent];
  const x = destination.marker[0];
  const z = destination.marker[2] + BUILDING_Z_OFFSET;

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(destination.id);
  };

  return (
    <group position={[x, 0, z]}>
      {/* Base slab */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[BUILDING_WIDTH + 1.4, 0.32, BUILDING_DEPTH + 1.4]} />
        <meshStandardMaterial color="#1c2b40" roughness={0.95} />
      </mesh>

      <group
        position={[0, selected ? 0.18 : 0, 0]}
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {/* Body */}
        <mesh position={[0, BUILDING_HEIGHT / 2 + 0.32, 0]}>
          <boxGeometry args={[BUILDING_WIDTH, BUILDING_HEIGHT, BUILDING_DEPTH]} />
          <meshStandardMaterial
            color={selected ? "#20334d" : hovered ? "#1c2c43" : "#172639"}
            roughness={0.82}
            metalness={0.08}
          />
        </mesh>

        {/* Accent wireframe */}
        <mesh position={[0, BUILDING_HEIGHT / 2 + 0.32, 0]} scale={1.004}>
          <boxGeometry args={[BUILDING_WIDTH, BUILDING_HEIGHT, BUILDING_DEPTH]} />
          <meshBasicMaterial color={accent} wireframe transparent opacity={selected ? 0.32 : 0.16} />
        </mesh>

        {/* Roof cap */}
        <mesh position={[0, BUILDING_HEIGHT + 0.44, 0]}>
          <boxGeometry args={[BUILDING_WIDTH + 0.5, 0.26, BUILDING_DEPTH + 0.5]} />
          <meshStandardMaterial color="#24364f" roughness={0.9} />
        </mesh>

        {/* Roof service block */}
        <mesh position={[0, BUILDING_HEIGHT + 0.78, 0]}>
          <boxGeometry args={[3.2, 0.42, 2.2]} />
          <meshStandardMaterial color="#2a3f5b" roughness={0.88} />
        </mesh>

        {/* Door */}
        <mesh position={[0, 1.55, BUILDING_DEPTH / 2 + 0.06]}>
          <planeGeometry args={[2, 2.5]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.18}
            roughness={0.5}
          />
        </mesh>

        <WindowStrip accent={accent} y={4.55} />

        {/* Ground marker ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.36, BUILDING_DEPTH / 2 + 2.2]}>
          <ringGeometry args={[0.85, 1.05, 40]} />
          <meshBasicMaterial color={accent} transparent opacity={selected ? 0.95 : 0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.36, BUILDING_DEPTH / 2 + 2.2]}>
          <circleGeometry args={[0.32, 24]} />
          <meshBasicMaterial color={accent} transparent opacity={0.9} />
        </mesh>

        {activeSession ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.38, BUILDING_DEPTH / 2 + 2.2]}>
            <ringGeometry args={[1.25, 1.36, 48]} />
            <meshBasicMaterial color="#57b7c2" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        ) : null}
      </group>

      <Html
        center
        portal={portal}
        distanceFactor={17}
        position={[0, BUILDING_HEIGHT + 2.05, 0]}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="whitespace-nowrap rounded-sm border px-2.5 py-1.5 text-center font-mono uppercase leading-none tracking-[0.14em] backdrop-blur-sm"
          style={{
            borderColor: selected ? accent : "rgba(255,255,255,0.16)",
            background: "rgba(11,20,33,0.82)",
            color: selected ? "#f5f2ea" : "rgba(245,242,234,0.72)",
            boxShadow: selected ? `0 0 24px -6px ${accent}` : "none",
          }}
        >
          <span className="block text-[10px]">{destination.shortName}</span>
          <span className="mt-1 block text-[7.5px] tracking-[0.2em] text-white/45">
            {destination.code}
          </span>
        </div>
      </Html>
    </group>
  );
}

function Walkway({ to }: { to: Vec3 }) {
  const start = new THREE.Vector3(...PLAZA);
  const end = new THREE.Vector3(to[0], 0.05, to[2] + BUILDING_DEPTH / 2 + 2.2);
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const angle = Math.atan2(end.x - start.x, end.z - start.z);

  return (
    <group position={[midpoint.x, 0.05, midpoint.z]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[2.7, 0.06, length]} />
        <meshStandardMaterial color="#223650" roughness={1} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.07, 0.02, length - 1]} />
        <meshBasicMaterial color="#7fa0c8" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function Plaza() {
  return (
    <group position={PLAZA}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[4.6, 64]} />
        <meshStandardMaterial color="#1b2c44" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.6, 2.75, 64]} />
        <meshBasicMaterial color="#8fb3dd" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial color="#c9d9ec" roughness={0.5} />
      </mesh>
      <pointLight position={[0, 2.2, 0]} intensity={7} distance={12} color="#9db7d4" />
    </group>
  );
}

const TREES: Vec3[] = [
  [-26, 0, 8],
  [-22, 0, 15],
  [-8, 0, 17],
  [8, 0, 17],
  [22, 0, 15],
  [26, 0, 8],
  [-28, 0, -3],
  [28, 0, -3],
  [-12, 0, -18],
  [12, 0, -18],
  [0, 0, 21],
  [-20, 0, -14],
  [20, 0, -14],
];

function Tree({ position }: { position: Vec3 }) {
  const scale = 0.8 + ((Math.abs(position[0]) + Math.abs(position[2])) % 5) * 0.08;
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.5, 6]} />
        <meshStandardMaterial color="#3d3226" roughness={1} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color="#24463a" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.42, 2.35, 0.2]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#2c5444" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Site({
  selectedId,
  activeSessionId,
  onSelect,
  portal,
}: {
  selectedId: LabId | null;
  activeSessionId: LabId | null;
  onSelect: (id: LabId) => void;
  portal?: any;
}) {
  return (
    <>
      <color attach="background" args={["#0c1626"]} />
      <fog attach="fog" args={["#0c1626", 38, 82]} />

      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#c9d9ec", "#0e1a29", 0.55]} />
      <directionalLight position={[14, 22, 16]} intensity={1.5} color="#f2f6ff" />
      <directionalLight position={[-18, 10, -12]} intensity={0.35} color="#6f92bd" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[90, 84]} />
        <meshStandardMaterial color="#0f1a28" roughness={1} />
      </mesh>
      <gridHelper args={[90, 45, "#22344a", "#162335"]} position={[0, -0.01, 0]} />

      <Plaza />
      {CAMPUS_DESTINATIONS.map((destination) => (
        <Walkway key={`walk-${destination.id}`} to={destination.marker} />
      ))}

      {TREES.map((position, index) => (
        <Tree key={`tree-${index}`} position={position} />
      ))}

      {CAMPUS_DESTINATIONS.map((destination) => (
        <Block
          key={destination.id}
          destination={destination}
          selected={selectedId === destination.id}
          activeSession={activeSessionId === destination.id}
          onSelect={onSelect}
          portal={portal}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={12}
        maxDistance={52}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.18}
      />
    </>
  );
}

export interface CampusCanvasProps {
  selectedId: LabId | null;
  activeSessionId: LabId | null;
  onSelect: (id: LabId) => void;
  animateCamera: boolean;
}

export default function CampusCanvas({ selectedId, activeSessionId, onSelect, animateCamera }: CampusCanvasProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const selected = selectedId ? CAMPUS_DESTINATIONS.find((entry) => entry.id === selectedId) : null;
  const camera = selected ? selected.camera : CAMPUS_OVERVIEW.camera;
  const target = selected ? selected.target : CAMPUS_OVERVIEW.target;

  return (
    <>
      <div
        ref={portalRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      />
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: CAMPUS_OVERVIEW.camera, fov: 42, near: 0.1, far: 200 }}
      >
        <Site selectedId={selectedId} activeSessionId={activeSessionId} onSelect={onSelect} portal={portalRef} />
        <CameraRig
          position={camera}
          target={target}
          animate={animateCamera}
          presetKey={selectedId ?? "overview"}
        />
      </Canvas>
    </>
  );
}
