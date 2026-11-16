"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./observer";
import { ProximaBeacon } from "./ProximaBeacon";
import { Starfield } from "./Starfield";

export function Ambient() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      const lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 0.9,
        anchors: true,
        prevent: (node) => node.closest?.("canvas, [data-lenis-prevent]") != null,
      });
      let raf = requestAnimationFrame(function tick(time) {
        lenis.raf(time);
        raf = requestAnimationFrame(tick);
      });
      destroy = () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

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
