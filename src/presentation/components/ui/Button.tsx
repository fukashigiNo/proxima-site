import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/presentation/lib/cn";

type Variant = "primary" | "ghost";

const base =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border px-6 text-[15px] font-medium no-underline transition-[background-color,color,border-color,filter,scale] duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-accent text-on-accent enabled:hover:brightness-110 [a&]:hover:brightness-110",
  ghost:
    "border-line-strong bg-surface/40 text-ink enabled:hover:border-ink/60 enabled:hover:bg-surface-2 [a&]:hover:border-ink/60 [a&]:hover:bg-surface-2",
};

export const buttonClass = (variant: Variant = "primary", className?: string) => cn(base, variants[variant], className);

export function Button({ variant = "primary", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant }) {
  const link = <Link href={href} className={buttonClass(variant, className)} {...props} />;
  return link;
}
