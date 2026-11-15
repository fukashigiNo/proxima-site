"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";

/** Отдаляет камеру в узких (портретных) контейнерах, чтобы модель целиком помещалась по ширине. */
export function ResponsiveCamera({ minAspect = 1.05 }: { minAspect?: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);

  useEffect(() => {
    camera.zoom = Math.min(1, width / height / minAspect);
    camera.updateProjectionMatrix();
  }, [camera, width, height, minAspect]);

  return null;
}
