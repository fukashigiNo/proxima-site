"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Box3, Vector3, type Group } from "three";

export function Normalize({ size = 1.6, children }: { size?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);

  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;
    group.scale.setScalar(1);
    group.position.set(0, 0, 0);
    group.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(group);
    const dims = box.getSize(new Vector3());
    const scale = size / Math.max(dims.x, dims.y, dims.z, 1e-3);
    group.scale.setScalar(scale);
    group.position.copy(box.getCenter(new Vector3()).multiplyScalar(-scale));
  });

  return <group ref={ref}>{children}</group>;
}
