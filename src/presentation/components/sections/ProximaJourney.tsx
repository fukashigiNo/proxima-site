"use client";

import { AnimatePresence, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { SHOT_INFO } from "../three/proxima/shots";
import { CountUp } from "../motion/CountUp";

const ProximaSystemScene = dynamic(() => import("../three/proxima/ProximaSystemScene"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center">
      <span className="size-24 rounded-full bg-accent/40 blur-2xl" />
    </div>
  ),
});

export interface JourneyStation {
  index: string;
  title: string;
  text?: string;
  stats?: { value: string; label: string }[];
  primary?: boolean;
}

const DWELL = 0.45;
const dwell = (v: number, n: number) => {
  if (n < 2) return 0;
  const f = Math.min(Math.max(v, 0), 1) * (n - 1);
  const i = Math.min(Math.floor(f), n - 2);
  const t = Math.min(Math.max((f - i - DWELL / 2) / (1 - DWELL), 0), 1);
  return (i + t * t * (3 - 2 * t)) / (n - 1);
};

export function ProximaJourney({ stations }: { stations: JourneyStation[] }) {
  const section = useRef<HTMLElement>(null);
  const n = stations.length;
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  const progress = useTransform(smooth, (v) => dwell(v, n));

  useMotionValueEvent(progress, "change", (v) => {
    const next = Math.round(v * (n - 1));
    setActive((prev) => (prev === next ? prev : next));
  });

  const station = stations[active];
  const info = SHOT_INFO[active];
  const Heading = station.primary ? "h1" : "h2";

  return (
    <section ref={section} className="relative -mt-[var(--header-h)]" style={{ height: `${n * 70 + 100}vh` }} aria-label="Система Проксимы">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <ProximaSystemScene progress={progress} className="!absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 [background:linear-gradient(90deg,rgba(7,9,12,0.85)_0%,rgba(7,9,12,0.5)_30%,transparent_55%)] max-lg:[background:linear-gradient(0deg,rgba(7,9,12,0.92)_0%,rgba(7,9,12,0.6)_40%,transparent_65%)]" />

        <div className="pointer-events-none absolute right-4 top-[calc(var(--header-h)+12px)] text-right font-mono text-[11px] uppercase tracking-[0.12em] sm:right-8">
          <AnimatePresence mode="wait">
            <m.div
              key={info?.name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35 }}
              className="grid gap-1"
            >
              <span className="text-accent-2">{info?.name}</span>
              <span className="normal-case tracking-normal text-muted">{info?.fact}</span>
            </m.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 mx-auto w-[min(1280px,100%-32px)] max-lg:bottom-24 lg:top-1/2 lg:-translate-y-1/2">
          <AnimatePresence mode="wait">
            <m.div
              key={station.index}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid max-w-[520px] gap-4 max-lg:mx-auto max-lg:text-center"
            >
              <span className="font-mono text-[12px] tracking-[0.16em] text-accent-2">[ {station.index} ]</span>
              <Heading
                className={
                  station.primary
                    ? "text-[clamp(38px,5.5vw,80px)] font-semibold leading-[0.95] tracking-[-0.045em]"
                    : "text-[clamp(28px,3.4vw,50px)] font-semibold leading-[1.02] tracking-[-0.04em]"
                }
              >
                {station.title}
              </Heading>
              {station.text && <p className="text-[16px] leading-relaxed text-muted sm:text-[17px]">{station.text}</p>}
              {station.stats && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-left">
                  {station.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-glow text-[clamp(28px,3vw,42px)] font-semibold tracking-[-0.04em] text-accent">
                        <CountUp value={s.value} />
                      </dt>
                      <dd className="text-[13px] leading-snug text-muted">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </m.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 bottom-6 mx-auto grid w-[min(1280px,100%-32px)] gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted sm:bottom-10">
          <div className="flex justify-between gap-4">
            <span className="truncate">
              Система Проксимы<span className="max-sm:hidden"> · прокрутите</span>
            </span>
            <span className="shrink-0 whitespace-nowrap">
              <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
          </div>
          <div className="h-px overflow-hidden bg-line-strong">
            <m.div className="h-full origin-left bg-accent shadow-[0_0_12px_var(--glow)]" style={{ scaleX: smooth }} />
          </div>
        </div>
      </div>
    </section>
  );
}
