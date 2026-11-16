"use client";

import { RoundedBox } from "@react-three/drei";
import { GlowStrip, PartMaterial } from "../parts/PartMaterial";
import { MM, SCENE_COLORS as C } from "../theme";
import { Fan } from "./Fan";

const SLOT_MM = 20;
const CARD_HEIGHT = 0.6;

export function Gpu({ lengthMm, fans, slots }: { lengthMm: number; fans: 2 | 3; slots: number }) {
  const length = lengthMm * MM;
  const thickness = slots * SLOT_MM * MM;
  const fanSize = Math.min(0.42, (length / fans) * 0.9);

  return (
    <group position={[length / 2, -thickness / 2, CARD_HEIGHT / 2 + 0.02]}>
      <RoundedBox args={[length, thickness, CARD_HEIGHT]} radius={0.03}>
        <PartMaterial color={C.dark} metalness={0.7} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, CARD_HEIGHT / 2 + 0.003]}>
        <boxGeometry args={[length * 0.96, thickness * 0.75, 0.005]} />
        <PartMaterial color="#3a3a40" metalness={0.8} roughness={0.3} />
      </mesh>
      <GlowStrip position={[length * 0.12, 0, CARD_HEIGHT / 2 + 0.007]} args={[length * 0.5, 0.012, 0.004]} />
      <mesh position={[-length / 2 - 0.01, 0, 0]}>
        <boxGeometry args={[0.02, thickness + 0.04, CARD_HEIGHT * 0.9]} />
        <PartMaterial color={C.metal} metalness={0.9} roughness={0.3} />
      </mesh>
      {Array.from({ length: fans }, (_, i) => (
        <Fan
          key={i}
          position={[-length / 2 + (length / fans) * (i + 0.5), -thickness / 2 - 0.005, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          size={fanSize}
          speed={7}
        />
      ))}
    </group>
  );
}
