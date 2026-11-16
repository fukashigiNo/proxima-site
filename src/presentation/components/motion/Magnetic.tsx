"use client";

import { useMotionValue, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type PointerEvent, type ReactNode } from "react";

export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.span ref={ref} className={className ?? "inline-flex"} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </m.span>
  );
}
