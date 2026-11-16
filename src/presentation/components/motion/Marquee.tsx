"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Marquee({ children, className, duration = 40 }: { children: ReactNode; className?: string; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`marquee group/marquee overflow-hidden ${className ?? ""}`}>
      <div
        className="marquee-track flex w-max group-hover/marquee:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s`, animationPlayState: running ? undefined : "paused" }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
