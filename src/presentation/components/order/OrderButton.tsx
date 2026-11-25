"use client";

import type { BuildSelection } from "@/domain/entities/Build";
import { buttonClass } from "../ui/Button";
import { useOrderModal } from "./OrderModal";

export function OrderButton({
  selection,
  title,
  variant = "primary",
  className,
  children = "Оформить заявку",
  part,
}: {
  part?: boolean;
  selection: BuildSelection;
  title?: string | null;
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}) {
  const openOrder = useOrderModal();
  const button = (
    <button type="button" className={buttonClass(variant, className)} onClick={() => openOrder({ selection, title: title ?? null, part })}>
      {children}
    </button>
  );
  return button;
}
