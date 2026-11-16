"use client";

import { PartMaterial } from "../parts/PartMaterial";
import { SCENE_COLORS as C } from "../theme";

export function Storage({ gen }: { gen: 4 | 5 }) {
  return (
    <group>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.36, 0.1, 0.01]} />
        <PartMaterial color="#123524" roughness={0.6} />
      </mesh>
      {[-0.08, 0.06].map((x) => (
        <mesh key={x} position={[x, 0, 0.02]}>
          <boxGeometry args={[0.1, 0.07, 0.008]} />
          <PartMaterial color="#111" roughness={0.5} />
        </mesh>
      ))}
      {gen === 5 &&
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[-0.15 + i * 0.05, 0, 0.06]}>
            <boxGeometry args={[0.015, 0.1, 0.08]} />
            <PartMaterial color={C.metal} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
    </group>
  );
}
