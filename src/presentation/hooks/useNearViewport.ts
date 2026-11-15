"use client";

import { useEffect, useRef, useState } from "react";

/**
 * true, как только элемент оказался рядом с экраном (и дальше остаётся true).
 * Используется, чтобы не создавать WebGL-контексты и не грузить three.js для невидимых блоков.
 */
export function useNearViewport<T extends Element>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}
