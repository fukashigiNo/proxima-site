"use client";

import { Float, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, type PointerEvent } from "react";
import { CATEGORY_LABELS, type ComponentCategory } from "@/domain/entities/PcComponent";
import { useInView } from "@/presentation/hooks/useInView";
import { PcModel, type PcModelProps } from "./PcModel";
import { SoftShadow } from "./parts/SoftShadow";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { SceneLights } from "./SceneLights";

interface PcSceneProps extends Omit<PcModelProps, "onPartHover"> {
  autoRotate?: boolean;
  className?: string;
}

/** Самодостаточная сцена: освещение без внешних HDR, рендер ставится на паузу вне экрана. */
export default function PcScene({ autoRotate = true, className, ...model }: PcSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLSpanElement>(null);
  const inView = useInView(container);
  const [hovered, setHovered] = useState<ComponentCategory | null>(null);

  // Позиция подсказки обновляется напрямую в DOM — без ре-рендера на каждое движение мыши
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
        <pointLight position={[0, 0.4, 0.2]} intensity={1.2} distance={2.5} color="#ffe2d6" />

        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
          <PcModel {...model} onPartHover={setHovered} />
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
        className="inline-block whitespace-nowrap rounded-full bg-ink px-3 py-1.5 font-mono text-xs tracking-[0.02em] text-bg"
        aria-hidden
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
      >
        {hovered ? CATEGORY_LABELS[hovered] : ""}
      </span>
    </div>
  );
}
