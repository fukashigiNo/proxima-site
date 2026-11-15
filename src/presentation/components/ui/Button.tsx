import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/presentation/lib/cn";

type Variant = "primary" | "ghost";

const base =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border px-6 text-[15px] font-medium no-underline transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "border-transparent bg-ink text-bg enabled:hover:bg-accent [a&]:hover:bg-accent",
  ghost: "border-line-strong bg-transparent text-ink enabled:hover:border-ink [a&]:hover:border-ink",
};

export const buttonClass = (variant: Variant = "primary", className?: string) => cn(base, variants[variant], className);

export function Button({ variant = "primary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

/** Кнопка-ссылка с клиентской навигацией Next.js. */
export function LinkButton({
  variant = "primary",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant }) {
  return <Link href={href} className={buttonClass(variant, className)} {...props} />;
}
