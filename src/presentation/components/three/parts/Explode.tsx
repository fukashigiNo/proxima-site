"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";

interface Props {
  active: boolean;
  offset: [number, number, number];
  children: ReactNode;
}

export function Explode({ active, offset, children }: Props) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;
    const t = Math.min(1, delta * 5);
    group.position.x += ((active ? offset[0] : 0) - group.position.x) * t;
    group.position.y += ((active ? offset[1] : 0) - group.position.y) * t;
    group.position.z += ((active ? offset[2] : 0) - group.position.z) * t;
  });

  return <group ref={ref}>{children}</group>;
}
