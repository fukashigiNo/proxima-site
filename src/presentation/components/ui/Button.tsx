import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/presentation/lib/cn";
import { Magnetic } from "../motion/Magnetic";

type Variant = "primary" | "ghost";

const base =
  "btn-shine inline-flex h-12 items-center justify-center gap-2.5 rounded-full border px-6 text-[15px] font-medium no-underline transition-[background-color,color,border-color,box-shadow,scale] duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-accent text-on-accent shadow-[0_8px_30px_-10px_var(--glow)] enabled:hover:shadow-[0_10px_40px_-6px_var(--glow)] [a&]:hover:shadow-[0_10px_40px_-6px_var(--glow)]",
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
  magnetic = false,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; magnetic?: boolean }) {
  const link = <Link href={href} className={buttonClass(variant, className)} {...props} />;
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
