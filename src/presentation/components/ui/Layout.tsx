import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-8", className)} {...props} />;
}

export function Section({
  id,
  surface = false,
  className,
  children,
}: {
  id?: string;
  surface?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-[120px]", surface && "bg-surface", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-mono text-[13px] uppercase tracking-[0.08em] text-muted", className)}>{children}</p>;
}

export function Label({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.06em] text-muted", className)}>{children}</p>;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pb-12 pt-14 sm:pt-24">
      <Container>
        <p className="mb-5 flex animate-rise items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
          <span className="size-2 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]" aria-hidden />
          {eyebrow}
          <span className="h-px w-16 bg-gradient-to-r from-line-strong to-transparent" aria-hidden />
        </p>
        <h1 className="max-w-[900px] animate-rise text-[clamp(38px,5.4vw,76px)] font-semibold leading-[0.98] tracking-[-0.045em] [animation-delay:80ms]">{title}</h1>
        {description && (
          <p className="mt-[18px] max-w-[640px] animate-rise text-[17px] leading-[1.55] text-muted [animation-delay:160ms]">{description}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
