"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { onceVisible } from "./observer";

interface Props {
  as?: ElementType;
  delay?: number;
  className?: string;
  children?: ReactNode;
  [attr: string]: unknown;
}

export function Reveal({ as: Tag = "div", delay = 0, className, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onceVisible(el, () => el.setAttribute("data-shown", ""));
  }, []);

  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;
  return (
    <Tag ref={ref} data-reveal="" className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
}
