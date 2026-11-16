"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { prefersReducedMotion } from "./observer";
import { ARRIVE_MS, PROXIMA_HREF, PROXIMA_SLOT_EVENT, PROXIMA_WARP_EVENT, WARP_MS, proximaPosition, setProximaSlot } from "./proxima";

export function ProximaBeacon() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const [inView, setVisible] = useState(false);
  const [inHeader, setInHeader] = useState(false);
  const visible = inView && pathname !== PROXIMA_HREF;
  const warping = useRef(false);

  useEffect(() => {
    let frame = 0;
    const header = document.querySelector("header");

    const measureSlot = () => {
      const logo = header?.querySelector<HTMLElement>('a[aria-label^="PRX"]');
      const row = logo?.parentElement;
      if (!logo || !row) return setProximaSlot(null);
      const next = [...row.children].find(
        (child) => child !== logo && child.getBoundingClientRect().width > 0 && child.getBoundingClientRect().left > logo.getBoundingClientRect().right,
      );
      const left = logo.getBoundingClientRect().right;
      const right = next ? next.getBoundingClientRect().left : window.innerWidth;
      setProximaSlot(right - left >= 64 ? { x: Math.round((left + right) / 2), y: Math.round(row.offsetTop + row.offsetHeight / 2) } : null);
    };

    const place = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const { x, y, clickable, inHeader: header_ } = proximaPosition(window.innerWidth, window.innerHeight, window.scrollY);
      const headerHidden = header?.hasAttribute("data-hidden") ?? false;
      const show = clickable && (header_ ? !headerHidden : y > 80);
      el.style.transform = `translate3d(${x - 24}px, ${y - 24}px, 0)`;
      setVisible((prev) => (prev === show ? prev : show));
      setInHeader((prev) => (prev === header_ ? prev : header_));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    const remeasure = () => {
      measureSlot();
      schedule();
    };

    remeasure();
    const resizeObserver = new ResizeObserver(remeasure);
    if (header) resizeObserver.observe(header);
    const attrObserver = new MutationObserver(schedule);
    if (header) attrObserver.observe(header, { attributes: true, attributeFilter: ["data-hidden"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener(PROXIMA_SLOT_EVENT, schedule);
    document.fonts?.ready.then(remeasure).catch(() => undefined);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      attrObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener(PROXIMA_SLOT_EVENT, schedule);
    };
  }, []);

  const prefetched = useRef(false);
  const prefetch = () => {
    if (prefetched.current) return;
    prefetched.current = true;
    router.prefetch(PROXIMA_HREF);
  };

  const arrive = () => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-warping")) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        root.dataset.arriving = "";
        delete root.dataset.warping;
        warping.current = false;
        window.setTimeout(() => delete root.dataset.arriving, ARRIVE_MS + 100);
      }),
    );
  };

  useEffect(() => {
    if (pathname === PROXIMA_HREF) arrive();
  }, [pathname]);

  const jump = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (warping.current) return;
    if (prefersReducedMotion()) {
      router.push(PROXIMA_HREF);
      return;
    }
    warping.current = true;
    const root = document.documentElement;
    root.dataset.warping = "";
    window.dispatchEvent(new CustomEvent(PROXIMA_WARP_EVENT));
    window.setTimeout(() => router.push(PROXIMA_HREF, { scroll: true }), WARP_MS - 200);
    window.setTimeout(() => arrive(), WARP_MS + 4000);
  };

  return (
    <a
      ref={ref}
      href={PROXIMA_HREF}
      onClick={jump}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      aria-label="Проксима — секретная страница о нас"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      data-proxima-beacon=""
      data-in-header={inHeader ? "" : undefined}
      className="group fixed left-0 top-0 z-[55] size-12 rounded-full [-webkit-tap-highlight-color:transparent] outline-offset-4 data-[hidden]:pointer-events-none data-[hidden]:opacity-0"
      data-hidden={visible ? undefined : ""}
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      <span className="absolute inset-0 scale-50 rounded-full border border-accent/70 opacity-0 shadow-[0_0_24px_var(--glow)] transition-[scale,opacity] duration-500 ease-out-soft group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100" />
      <span className="absolute inset-[-10px] scale-50 rounded-full border border-accent/25 opacity-0 transition-[scale,opacity] delay-75 duration-700 ease-out-soft group-hover:scale-100 group-hover:opacity-100" />
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap group-data-[in-header]:hidden rounded-full border border-line-strong bg-bg/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        <span className="text-accent">Proxima</span> · 4,24 св. года →
      </span>
    </a>
  );
}
