import Link from "next/link";
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
  return <p className={cn("text-[14px] text-muted", className)}>{children}</p>;
}

export function Label({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("text-[13px] text-muted", className)}>{children}</p>;
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
    <section className="pb-10 pt-10 sm:pt-16">
      <Container>
        <nav aria-label="Навигационная цепочка" className="mb-6 animate-rise text-[14px] text-muted">
          <Link href="/" className="text-muted no-underline hover:text-ink">
            Главная
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-ink">{eyebrow}</span>
        </nav>
        <h1 className="max-w-[860px] animate-rise text-[clamp(34px,4.6vw,64px)] font-semibold leading-[1.02] tracking-[-0.04em] [animation-delay:60ms]">{title}</h1>
        {description && (
          <p className="mt-5 max-w-[640px] animate-rise text-[17px] leading-relaxed text-muted [animation-delay:120ms]">{description}</p>
        )}
        {children}
      </Container>
    </section>
  );
}
