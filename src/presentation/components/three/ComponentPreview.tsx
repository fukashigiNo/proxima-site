"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { PcComponent } from "@/domain/entities/PcComponent";
import { useInView } from "@/presentation/hooks/useInView";
import { useVerticalTouchScroll } from "@/presentation/hooks/useVerticalTouchScroll";
import { ComponentModel } from "./ComponentModel";
import { Normalize } from "./parts/Normalize";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { SceneLights } from "./SceneLights";

interface Props {
  component: PcComponent;
  className?: string;
}

export default function ComponentPreview({ component, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container);
  useVerticalTouchScroll(container);

  return (
    <div ref={container} className={className} style={{ cursor: "grab" }}>
      <Canvas frameloop={inView ? "always" : "never"} dpr={[1, 1.5]} camera={{ position: [2.4, 1.4, 4.4], fov: 30 }} gl={{ alpha: true }}>
        <ResponsiveCamera minAspect={1} />
        <SceneLights />
        <Normalize key={component.id}>
          <ComponentModel component={component} />
        </Normalize>
        <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}
