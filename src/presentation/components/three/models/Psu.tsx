"use client";

import { GlowStrip, PartMaterial } from "../parts/PartMaterial";

/** Блок питания ATX (150×86×160 мм). Яркость полосы растёт с мощностью. */
export function Psu({ wattage }: { wattage: number }) {
  const stripe = Math.min(0.6, 0.2 + wattage / 3000);
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.68, 0.39, 0.72]} />
        <PartMaterial color="#141416" roughness={0.55} metalness={0.3} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.27 + i * 0.09, 0, 0.362]}>
          <boxGeometry args={[0.04, 0.26, 0.004]} />
          <PartMaterial color="#2a2a2e" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <GlowStrip position={[0, -0.16, 0.364]} args={[stripe, 0.014, 0.004]} />
    </group>
  );
}
