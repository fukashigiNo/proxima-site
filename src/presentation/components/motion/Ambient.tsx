"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./observer";
import { ProximaBeacon } from "./ProximaBeacon";
import { Starfield } from "./Starfield";

export function Ambient() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;

    let cancelled = false;
    let raf = 0;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(async () => {
      const { default: LenisClass } = await import("lenis");
      if (cancelled) return;
      const lenis = new LenisClass({
        lerp: 0.085,
        wheelMultiplier: 0.9,
        anchors: true,
        prevent: (node) => node.closest?.("[data-lenis-prevent]") != null,
      });
      lenisRef.current = lenis;
      raf = requestAnimationFrame(function tick(time) {
        lenis.raf(time);
        raf = requestAnimationFrame(tick);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <Starfield />
        <div className="absolute -right-40 -top-40 size-[640px] rounded-full opacity-40 [background:radial-gradient(closest-side,var(--glow-2),transparent)]" />
      </div>
      <ProximaBeacon />
    </>
  );
}
