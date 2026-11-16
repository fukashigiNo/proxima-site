"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const THRESHOLD = 6;
const TOP_ZONE = 80;

export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (y < TOP_ZONE) setHidden(false);
      else if (y > lastY + THRESHOLD) setHidden(true);
      else if (y < lastY - THRESHOLD) setHidden(false);
      if (Math.abs(y - lastY) > THRESHOLD || y < TOP_ZONE) lastY = y;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => setHidden(false), [pathname]);

  return (
    <header className={className} data-scrolled={scrolled ? "" : undefined} data-hidden={hidden ? "" : undefined}>
      {children}
    </header>
  );
}
