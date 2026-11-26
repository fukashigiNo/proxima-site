import { cn } from "@/presentation/lib/cn";

export const STAR_PATH =
  "M50 2C56.24 40.64 59.36 43.76 98 50C59.36 56.24 56.24 59.36 50 98C43.76 59.36 40.64 56.24 2 50C40.64 43.76 43.76 40.64 50 2Z";

export const SLOGAN = "Ближе к звёздам.";

export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("logo-star size-[1em] shrink-0 fill-current", className)} aria-hidden="true">
      <path d={STAR_PATH} />
    </svg>
  );
}

export function Logo({ className, title = "Proxima" }: { className?: string; title?: string }) {
  return (
    <span className={cn("logo inline-flex items-center gap-[0.4em] text-[22px] leading-none font-medium tracking-[-0.025em] text-ink", className)} role="img" aria-label={title}>
      <StarMark className="size-[0.95em]" />
      <span aria-hidden="true">Proxima</span>
    </span>
  );
}
