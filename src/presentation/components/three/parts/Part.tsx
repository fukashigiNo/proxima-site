"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useMemo, useState, type ReactNode } from "react";
import type { ComponentCategory } from "@/domain/entities/PcComponent";
import { PartContext, type PartStatus } from "./PartContext";

interface PartProps {
  category: ComponentCategory;
  active: boolean;
  conflict: boolean;
  ghost: boolean;
  onSelect?: (category: ComponentCategory) => void;
  onHoverChange?: (category: ComponentCategory | null) => void;
  children: ReactNode;
}

export function Part({ category, active, conflict, ghost, onSelect, onHoverChange, children }: PartProps) {
  const [hovered, setHovered] = useState(false);
  const status: PartStatus = conflict ? "error" : active || hovered ? "active" : "idle";
  const state = useMemo(() => ({ status, ghost }), [status, ghost]);

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    onHoverChange?.(category);
  };
  const handleOut = () => {
    setHovered(false);
    onHoverChange?.(null);
  };
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect?.(category);
  };

  return (
    <PartContext.Provider value={state}>
      <group onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
        {children}
      </group>
    </PartContext.Provider>
  );
}
