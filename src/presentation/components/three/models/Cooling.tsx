"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { BoxGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GlowStrip, PartMaterial } from "../parts/PartMaterial";
import { MM, SCENE_COLORS as C } from "../theme";
import { Fan } from "./Fan";

export function AirCooler({ heightMm }: { heightMm: number }) {
  const depth = heightMm * MM;
  const fins = useMemo(() => {
    const parts = Array.from({ length: 13 }, (_, i) =>
      new BoxGeometry(0.012, 0.46, depth - 0.06).translate(-0.17 + i * 0.028, 0, depth / 2 + 0.03),
    );
    const merged = mergeGeometries(parts)!;
    parts.forEach((p) => p.dispose());
    return merged;
  }, [depth]);
  return (
    <group>
      <mesh geometry={fins}>
        <PartMaterial color={C.fin} metalness={0.85} roughness={0.25} />
      </mesh>
      {[-0.08, 0, 0.08].map((y) => (
        <mesh key={y} position={[0, y, depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, depth, 8]} />
          <PartMaterial color="#b87333" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      <RoundedBox args={[0.38, 0.48, 0.04]} radius={0.012} position={[0, 0, depth + 0.01]}>
        <PartMaterial color={C.dark} roughness={0.4} />
      </RoundedBox>
      <Fan position={[0.22, 0, depth / 2 + 0.03]} rotation={[0, Math.PI / 2, 0]} size={0.42} speed={8} />
    </group>
  );
}

export function AioPump() {
  return (
    <group>
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.12, 40]} />
        <PartMaterial color={C.dark} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.132]}>
        <torusGeometry args={[0.1, 0.012, 10, 40]} />
        <PartMaterial color={C.accent} glow={1.4} />
      </mesh>
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 0.22, 0.1]}>
          <cylinderGeometry args={[0.018, 0.018, 0.34, 10]} />
          <PartMaterial color="#111113" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function AioRadiator({ radiatorMm }: { radiatorMm: number }) {
  const length = radiatorMm * MM;
  const fanCount = radiatorMm === 280 ? 2 : radiatorMm / 120;
  const fanSize = (length / fanCount) * 0.94;
  return (
    <group>
      <mesh>
        <boxGeometry args={[length, 0.12, fanSize + 0.04]} />
        <PartMaterial color={C.dark} metalness={0.5} roughness={0.5} />
      </mesh>
      <GlowStrip position={[0, 0.062, 0]} args={[length * 0.7, 0.004, 0.012]} />
      {Array.from({ length: fanCount }, (_, i) => (
        <Fan
          key={i}
          position={[-length / 2 + fanSize / 2 + i * (length / fanCount) + 0.01, -0.1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          size={fanSize}
          speed={6}
        />
      ))}
    </group>
  );
}
