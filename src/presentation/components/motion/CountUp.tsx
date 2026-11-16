"use client";

import { useEffect, useRef, useState } from "react";
import { onceVisible, prefersReducedMotion } from "./observer";

export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  const suffix = match?.[2] ?? "";
  const [current, setCurrent] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null || prefersReducedMotion()) return;
    setCurrent(0);
    let frame = 0;
    const stop = onceVisible(el, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setCurrent(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  if (target === null) return <span>{value}</span>;
  return (
    <span ref={ref} className="tabular-nums">
      {current ?? target}
      {suffix}
    </span>
  );
}
