"use client";

import type { BuildSelection } from "@/domain/entities/Build";
import { Magnetic } from "../motion/Magnetic";
import { buttonClass } from "../ui/Button";
import { useOrderModal } from "./OrderModal";

export function OrderButton({
  selection,
  title,
  variant = "primary",
  className,
  magnetic = false,
  children = "Оформить заявку",
}: {
  selection: BuildSelection;
  title?: string | null;
  variant?: "primary" | "ghost";
  className?: string;
  magnetic?: boolean;
  children?: React.ReactNode;
}) {
  const openOrder = useOrderModal();
  const button = (
    <button type="button" className={buttonClass(variant, className)} onClick={() => openOrder({ selection, title: title ?? null })}>
      {children}
    </button>
  );
  return magnetic ? <Magnetic>{button}</Magnetic> : button;
}
