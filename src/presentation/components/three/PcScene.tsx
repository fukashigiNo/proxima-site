"use client";

import { Float, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, type PointerEvent } from "react";
import { CATEGORY_LABELS, type ComponentCategory } from "@/domain/entities/PcComponent";
import { useInView } from "@/presentation/hooks/useInView";
import { useVerticalTouchScroll } from "@/presentation/hooks/useVerticalTouchScroll";
import { PcModel, type PcModelProps } from "./PcModel";
import { ExplodeProvider, type ExplodeSource } from "./parts/ScrollExplode";
import { SoftShadow } from "./parts/SoftShadow";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { SceneLights } from "./SceneLights";

interface PcSceneProps extends Omit<PcModelProps, "onPartHover"> {
  autoRotate?: boolean;
  className?: string;
  explode?: ExplodeSource;
}

export default function PcScene({ autoRotate = true, className, explode, ...model }: PcSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const inView = useInView(container);
  useVerticalTouchScroll(container);
  const [hovered, setHovered] = useState<ComponentCategory | null>(null);

  const moveTooltip = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    tooltip.current?.style.setProperty("transform", `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`);
  };

  return (
    <div
      ref={container}
      className={className}
      style={{ position: "relative", cursor: hovered && model.onPartSelect ? "pointer" : "grab" }}
      onPointerMove={moveTooltip}
    >
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [2.4, 1.3, 5.6], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => setHovered(null)}
      >
        <ResponsiveCamera />
        <SceneLights />
        <pointLight position={[0, 0.4, 0.2]} intensity={1.2} distance={2.5} color="#efe6ff" />
        <pointLight position={[-2.5, 1.5, -1.5]} intensity={6} distance={7} color="#8b5cf6" />
        <pointLight position={[2.5, -0.5, 2]} intensity={4} distance={7} color="#41d9ff" />

        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
          <ExplodeProvider value={explode ?? null}>
            <PcModel {...model} onPartHover={setHovered} />
          </ExplodeProvider>
        </Float>

        <SoftShadow />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate && !hovered}
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.9}
          enableDamping
        />
      </Canvas>
      <span
        ref={tooltip}
        className="inline-block whitespace-nowrap rounded-full border border-accent/60 bg-bg/90 px-3 py-1.5 text-xs text-ink"
        aria-hidden
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
      >
        {hovered ? CATEGORY_LABELS[hovered] : ""}
      </span>
    </div>
  );
}
