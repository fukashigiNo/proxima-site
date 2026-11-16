"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";

export function Appear({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || group.scale.x >= 1) return;
    group.scale.setScalar(Math.min(1, group.scale.x + delta * 1.4));
  });
  return (
    <group ref={ref} scale={0.82}>
      {children}
    </group>
  );
}
