"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./observer";
import { ARRIVE_MS, PROXIMA_HREF, PROXIMA_SLOT_EVENT, PROXIMA_WARP_EVENT, WARP_MS, isWarping, proximaPosition } from "./proxima";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  depth: number;
  twinkle: number;
  phase: number;
  hue: "cold" | "white" | "warm";
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const COLORS = {
  dark: { cold: "190, 215, 255", white: "245, 248, 255", warm: "255, 214, 170" },
  light: { cold: "40, 70, 120", white: "30, 40, 60", warm: "150, 80, 40" },
};

const random = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

export function Starfield() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    const cache = document.createElement("canvas");
    const cacheCtx = cache.getContext("2d")!;
    let cacheScroll = Number.NaN;
    let activated = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let theme: "dark" | "light" = "dark";
    let frame = 0;
    let running = false;
    let last = 0;
    let nextMeteor = performance.now() + 4000;
    let warpStart = -1;
    let arriveStart = -1;

    const readTheme = () => {
      theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    };

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cache.width = el.width;
      cache.height = el.height;
      cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cacheScroll = Number.NaN;

      const rand = random(20251116);
      const skyHeight = height * 2.2;
      const count = Math.min(520, Math.round((width * skyHeight) / 3600));
      stars = Array.from({ length: count }, () => {
        const depth = 0.15 + rand() ** 2 * 0.85;
        const roll = rand();
        return {
          x: rand(),
          y: rand() * skyHeight,
          r: 0.35 + depth * 1.15 * (0.6 + rand() * 0.6),
          alpha: 0.25 + depth * 0.6 * rand() + 0.15,
          depth,
          twinkle: rand() < 0.14 ? 0.6 + rand() * 2.2 : 0,
          phase: rand() * Math.PI * 2,
          hue: roll < 0.18 ? "cold" : roll > 0.9 ? "warm" : "white",
        } satisfies Star;
      });
    };

    const plot = (target: CanvasRenderingContext2D, s: Star, scroll: number, twinkle: number) => {
      const span = height * 2.2;
      let y = (s.y - scroll * s.depth * 0.25) % span;
      if (y < 0) y += span;
      if (y > height + 4) return;
      const color = COLORS[theme][s.hue];
      const a = s.alpha * twinkle * (theme === "light" ? 0.45 : 1);
      target.fillStyle = `rgba(${color}, ${a})`;
      target.beginPath();
      target.arc(s.x * width, y, s.r, 0, Math.PI * 2);
      target.fill();
      if (s.r > 1.25 && theme === "dark") {
        target.fillStyle = `rgba(${color}, ${a * 0.12})`;
        target.beginPath();
        target.arc(s.x * width, y, s.r * 3.2, 0, Math.PI * 2);
        target.fill();
      }
    };

    const drawWarp = (time: number, t: number) => {
      const scroll = window.scrollY;
      const c = proximaPosition(width, height, scroll);
      const color = theme === "light" ? "30, 40, 60" : "235, 242, 255";
      const ease = t * t * t;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      for (const s of stars) {
        const span = height * 2.2;
        let y = (s.y - scroll * s.depth * 0.25) % span;
        if (y < 0) y += span;
        if (y > height + 4) continue;
        const x = s.x * width;
        const dx = x - c.x;
        const dy = y - c.y;
        const stretch = ease * (2 + s.depth * 4);
        ctx.strokeStyle = `rgba(${color}, ${Math.min(1, s.alpha + t * 0.6)})`;
        ctx.lineWidth = s.r * (1 + t);
        ctx.beginPath();
        ctx.moveTo(x + dx * stretch * 0.55, y + dy * stretch * 0.55);
        ctx.lineTo(x + dx * stretch, y + dy * stretch);
        ctx.stroke();
      }
      drawFlash(c.x, c.y, ease, t);
    };

    const drawFlash = (x: number, y: number, spread: number, intensity: number) => {
      const radius = 46 + spread * Math.hypot(width, height);
      const flash = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const core = theme === "light" ? "255, 120, 80" : "255, 110, 70";
      flash.addColorStop(0, `rgba(255, 235, 220, ${0.9 * intensity})`);
      flash.addColorStop(0.15, `rgba(${core}, ${0.5 * intensity})`);
      flash.addColorStop(1, `rgba(${core}, 0)`);
      ctx.fillStyle = flash;
      ctx.fillRect(0, 0, width, height);
    };

    const draw = (time: number) => {
      if (warpStart >= 0) {
        const t = (time - warpStart) / WARP_MS;
        if (t < 1 || isWarping()) {
          drawWarp(time, Math.min(1, Math.max(0, t)));
          return;
        }
        warpStart = -1;
        arriveStart = time;
        cacheScroll = Number.NaN;
      }
      const scroll = window.scrollY;
      if (Math.abs(scroll - cacheScroll) > 0.5 || Number.isNaN(cacheScroll)) {
        cacheCtx.clearRect(0, 0, width, height);
        for (const s of stars) if (!running || s.twinkle === 0) plot(cacheCtx, s, scroll, 1);
        cacheScroll = scroll;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(cache, 0, 0);
      ctx.restore();
      if (running) {
        for (const s of stars) if (s.twinkle > 0) plot(ctx, s, scroll, 0.6 + 0.4 * Math.sin(time * 0.001 * s.twinkle + s.phase));
      }
      drawProxima(time, scroll);
      if (running) drawMeteors(time);

      if (arriveStart >= 0) {
        const k = (time - arriveStart) / ARRIVE_MS;
        if (k < 1) {
          const c = proximaPosition(width, height, scroll);
          drawFlash(c.x, c.y, 1, (1 - k) * (1 - k));
        } else {
          arriveStart = -1;
          if (!activated) {
            running = false;
            cancelAnimationFrame(frame);
          }
        }
      }
    };

    const drawProxima = (time: number, scroll: number) => {
      if (window.location.pathname === PROXIMA_HREF && warpStart < 0) return;
      const { x, y, scale: k } = proximaPosition(width, height, scroll);
      if (y < -60) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(k, k);
      ctx.translate(-x, -y);
      const pulse = running ? 0.85 + 0.15 * Math.sin(time * 0.0013) : 1;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 46);
      const core = theme === "light" ? "220, 70, 30" : "255, 110, 70";
      glow.addColorStop(0, `rgba(${core}, ${0.55 * pulse})`);
      glow.addColorStop(0.25, `rgba(${core}, ${0.18 * pulse})`);
      glow.addColorStop(1, `rgba(${core}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${core}, ${0.35 * pulse})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 22, y);
      ctx.lineTo(x + 22, y);
      ctx.moveTo(x, y - 22);
      ctx.lineTo(x, y + 22);
      ctx.stroke();
      ctx.fillStyle = theme === "light" ? "rgba(200, 60, 25, 0.95)" : "rgba(255, 225, 205, 0.95)";
      ctx.beginPath();
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMeteors = (time: number) => {
      if (time > nextMeteor) {
        const angle = Math.PI * (0.62 + Math.random() * 0.12);
        const speed = 9 + Math.random() * 5;
        meteors.push({
          x: width * (0.35 + Math.random() * 0.6),
          y: height * Math.random() * 0.35,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
        });
        nextMeteor = time + 6000 + Math.random() * 9000;
      }
      const color = theme === "light" ? "30, 40, 60" : "255, 255, 255";
      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.022;
        const tail = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        tail.addColorStop(0, `rgba(${color}, ${0.85 * m.life})`);
        tail.addColorStop(1, `rgba(${color}, 0)`);
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
        ctx.stroke();
      }
    };

    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (warpStart < 0 && arriveStart < 0 && time - last < 33) return;
      last = time;
      draw(time);
    };

    const start = () => {
      if (running || prefersReducedMotion() || document.hidden) return;
      running = true;
      cacheScroll = Number.NaN;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cacheScroll = Number.NaN;
      cancelAnimationFrame(frame);
    };

    const HUMAN = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
    const onHuman = () => {
      activated = true;
      HUMAN.forEach((e) => window.removeEventListener(e, onHuman));
      start();
    };
    HUMAN.forEach((e) => window.addEventListener(e, onHuman, { passive: true }));

    readTheme();
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const firstPaint = idle(
      () => {
        build();
        draw(performance.now());
        el.style.opacity = "1";
      },
      { timeout: 1500 },
    );

    let scrollQueued = false;
    const onScroll = () => {
      if (running || scrollQueued || width === 0) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        draw(performance.now());
      });
    };
    const onResize = () => {
      build();
      draw(performance.now());
    };
    const onWarp = () => {
      if (!width) return;
      warpStart = performance.now();
      if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };
    window.addEventListener(PROXIMA_WARP_EVENT, onWarp);
    const onSlot = () => {
      cacheScroll = Number.NaN;
      if (width) draw(performance.now());
    };
    window.addEventListener(PROXIMA_SLOT_EVENT, onSlot);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (activated) start();
    };
    const themeObserver = new MutationObserver(() => {
      readTheme();
      cacheScroll = Number.NaN;
      if (width) draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      cancelIdle(firstPaint);
      HUMAN.forEach((e) => window.removeEventListener(e, onHuman));
      window.removeEventListener(PROXIMA_WARP_EVENT, onWarp);
      window.removeEventListener(PROXIMA_SLOT_EVENT, onSlot);
      themeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas ref={canvas} className="absolute inset-0 size-full opacity-0 transition-opacity duration-1000" aria-hidden />
  );
}
