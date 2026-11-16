import { cn } from "@/presentation/lib/cn";

type Arrow = "down-left" | "down-right" | "up-left" | "left" | "down";

const ARROWS: Record<Arrow, { d: string; head: string; className: string }> = {
  "down-left": {
    d: "M58 4 C 52 22, 38 34, 12 44",
    head: "M20 36 L 11 44.5 L 23 47",
    className: "left-0 top-full h-12 w-16 -translate-x-2",
  },
  "down-right": {
    d: "M6 4 C 12 22, 26 34, 52 44",
    head: "M44 36 L 53 44.5 L 41 47",
    className: "right-0 top-full h-12 w-16 translate-x-2",
  },
  "up-left": {
    d: "M58 46 C 50 30, 36 16, 12 8",
    head: "M22 4 L 11 8 L 19 17",
    className: "bottom-full left-0 h-12 w-16 -translate-x-2",
  },
  left: {
    d: "M60 22 C 44 14, 26 26, 6 22",
    head: "M14 14 L 5 22 L 15 29",
    className: "right-full top-1/2 h-10 w-16 -translate-y-1/2",
  },
  down: {
    d: "M30 2 C 24 16, 36 26, 30 42",
    head: "M22 34 L 30 43 L 37 33",
    className: "left-1/2 top-full h-12 w-14 -translate-x-1/2",
  },
};

export function Note({
  children,
  arrow,
  className,
  rotate = -3,
}: {
  children: React.ReactNode;
  arrow?: Arrow;
  className?: string;
  rotate?: number;
}) {
  const a = arrow ? ARROWS[arrow] : null;
  return (
    <span
      className={cn("pointer-events-none relative inline-block font-hand text-[25px] leading-tight text-accent", className)}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
      {a && (
        <svg viewBox="0 0 64 50" className={cn("absolute overflow-visible", a.className)} fill="none" aria-hidden>
          <path d={a.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d={a.head} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
