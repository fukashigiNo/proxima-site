"use client";

import { useEffect, type RefObject } from "react";

export function useVerticalTouchScroll(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const relax = () => {
      for (const el of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
        if (el.style.touchAction === "none") el.style.touchAction = "pan-y";
      }
    };
    relax();
    const observer = new MutationObserver(relax);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [container]);
}
