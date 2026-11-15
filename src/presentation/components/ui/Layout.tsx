import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/presentation/lib/cn";

/** Центрированная колонка контента с боковыми полями. */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-8", className)} {...props} />;
}

/** Секция страницы с вертикальным ритмом; surface — альтернативный фон. */
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

/** Моноширинная надпись над заголовком. */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-mono text-[13px] uppercase tracking-[0.08em] text-muted", className)}>{children}</p>;
}

/** Маленькая подпись-метка (лейбл значения). */
export function Label({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.06em] text-muted", className)}>{children}</p>;
}

/** Шапка внутренней страницы: надпись, заголовок h1 и описание. */
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
    <section className="pb-10 pt-14 sm:pt-20">
      <Container>
        <Eyebrow className="mb-4">
          <span className="text-accent">●</span> {eyebrow}
        </Eyebrow>
        <h1 className="max-w-[900px] text-[clamp(36px,5vw,64px)] font-medium leading-none tracking-[-0.04em]">{title}</h1>
        {description && <p className="mt-[18px] max-w-[640px] text-[17px] leading-[1.55] text-muted">{description}</p>}
        {children}
      </Container>
    </section>
  );
}
