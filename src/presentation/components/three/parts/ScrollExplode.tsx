"use client";

import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useRef, type ReactNode } from "react";
import type { Group } from "three";

export interface ExplodeSource {
  get(): number;
}

const ExplodeContext = createContext<ExplodeSource | null>(null);
export const ExplodeProvider = ExplodeContext.Provider;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function ScrollExplode({
  offset,
  start = 0,
  span = 0.55,
  children,
}: {
  offset: [number, number, number];
  start?: number;
  span?: number;
  children: ReactNode;
}) {
  const source = useContext(ExplodeContext);
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || !source) return;
    const local = smoothstep(Math.min(1, Math.max(0, (source.get() - start) / span)));
    const t = Math.min(1, delta * 8);
    group.position.x += (offset[0] * local - group.position.x) * t;
    group.position.y += (offset[1] * local - group.position.y) * t;
    group.position.z += (offset[2] * local - group.position.z) * t;
  });

  return <group ref={ref}>{children}</group>;
}
