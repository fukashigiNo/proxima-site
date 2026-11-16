"use client";

import { GlowStrip, PartMaterial } from "../parts/PartMaterial";
import { SCENE_COLORS as C } from "../theme";

export function Ram({ sticks }: { sticks: 2 | 4 }) {
  const slots = sticks === 2 ? [1, 3] : [0, 1, 2, 3];
  return (
    <group>
      {slots.map((slot) => (
        <group key={slot} position={[slot * 0.055, 0, 0.09]}>
          <mesh>
            <boxGeometry args={[0.026, 0.6, 0.15]} />
            <PartMaterial color={C.dark} metalness={0.6} roughness={0.35} />
          </mesh>
          <GlowStrip position={[0, 0, 0.078]} args={[0.027, 0.56, 0.006]} />
        </group>
      ))}
    </group>
  );
}
