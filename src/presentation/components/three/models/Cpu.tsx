"use client";

import { PartMaterial } from "../parts/PartMaterial";
import { SCENE_COLORS as C } from "../theme";

export function Cpu() {
  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.2, 0.2, 0.012]} />
        <PartMaterial color="#1f5a3c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.16, 0.16, 0.02]} />
        <PartMaterial color={C.metal} metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}
