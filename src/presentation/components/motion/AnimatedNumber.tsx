"use client";

import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./observer";

export function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const motionValue = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (ref.current) ref.current.textContent = format(Math.round(latest));
  });

  useEffect(() => {
    if (prefersReducedMotion()) {
      motionValue.jump(value);
      return;
    }
    const controls = animate(motionValue, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
