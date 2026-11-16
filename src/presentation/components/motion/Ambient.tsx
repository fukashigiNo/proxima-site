"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./observer";
import { ProximaBeacon } from "./ProximaBeacon";
import { Starfield } from "./Starfield";

export function Ambient() {
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const fine = window.matchMedia("(pointer: fine)").matches;
    let lastCard: HTMLElement | null = null;

    const onMove = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]") ?? null;
      if (lastCard && lastCard !== card) lastCard.style.removeProperty("--spot-o");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--y", `${event.clientY - rect.top}px`);
        card.style.setProperty("--spot-o", "1");
      }
      lastCard = card;
    };

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    let destroy: (() => void) | undefined;
    if (fine && !reduce) {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle(async () => {
        const { default: Lenis } = await import("lenis");
        const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: true, prevent: (node) => node.closest?.("canvas, [data-lenis-prevent]") != null });
        let raf = requestAnimationFrame(function tick(time) {
          lenis.raf(time);
          raf = requestAnimationFrame(tick);
        });
        destroy = () => {
          cancelAnimationFrame(raf);
          lenis.destroy();
        };
      });
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      destroy?.();
    };
  }, []);

  return (
    <>
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <Starfield />
      <div className="absolute -right-40 -top-40 size-[640px] rounded-full opacity-50 [background:radial-gradient(closest-side,var(--glow-2),transparent)]" />
    </div>
    <ProximaBeacon />
    </>
  );
}
