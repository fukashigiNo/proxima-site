"use client";

import type { ReactNode } from "react";
import type { ComponentCategory } from "@/domain/entities/PcComponent";
import { BOARD_LAYOUTS, BOARD_ORIGIN, BOARD_Z, GPU_BRACKET_X } from "./layout";
import { CaseShell } from "./models/CaseShell";
import { AioPump, AioRadiator, AirCooler } from "./models/Cooling";
import { Cpu } from "./models/Cpu";
import { Gpu } from "./models/Gpu";
import { Motherboard } from "./models/Motherboard";
import { Psu } from "./models/Psu";
import { Ram } from "./models/Ram";
import { Storage } from "./models/Storage";
import { Appear } from "./parts/Appear";
import { Explode } from "./parts/Explode";
import { Part } from "./parts/Part";
import { GHOST_SPEC, type PcVisualSpec } from "./visualSpec";

export interface PcModelProps {
  spec: PcVisualSpec;
  activeCategory?: ComponentCategory | null;
  conflicts?: readonly ComponentCategory[];
  onPartSelect?: (category: ComponentCategory) => void;
  onPartHover?: (category: ComponentCategory | null) => void;
}

/**
 * Собранный ПК. Каждая деталь параметрическая и берёт размеры из выбранного комплектующего;
 * невыбранные рисуются «призраками». Оси: X — от тыла (−) к фронту (+), Y — вверх, Z — к стеклу.
 */
export function PcModel({ spec, activeCategory, conflicts = [], onPartSelect, onPartHover }: PcModelProps) {
  const board = spec.board ?? GHOST_SPEC.board;
  const layout = BOARD_LAYOUTS[board.formFactor];
  const cooler = spec.cooler ?? GHOST_SPEC.cooler;
  const gpu = spec.gpu ?? GHOST_SPEC.gpu;
  const ram = spec.ram ?? GHOST_SPEC.ram;
  const storage = spec.storage ?? GHOST_SPEC.storage;
  const psu = spec.psu ?? GHOST_SPEC.psu;
  const pcCase = spec.case ?? GHOST_SPEC.case;

  /** Обёртка детали: состояние, интерактивность и анимация при замене. */
  const part = (category: ComponentCategory, selected: { id: string } | null, children: ReactNode) => (
    <Part
      category={category}
      active={activeCategory === category}
      conflict={conflicts.includes(category)}
      ghost={!selected}
      onSelect={onPartSelect}
      onHoverChange={onPartHover}
    >
      <Appear key={selected?.id ?? "ghost"}>{children}</Appear>
    </Part>
  );

  return (
    <group position={[0, 0.05, 0]}>
      {part("case", spec.case, <CaseShell color={pcCase.color} />)}

      <group position={[BOARD_ORIGIN[0], BOARD_ORIGIN[1], BOARD_Z]}>
        {part("motherboard", spec.board, <Motherboard formFactor={board.formFactor} />)}
      </group>

      <group position={[layout.socket[0], layout.socket[1], BOARD_Z]}>
        {part("cpu", spec.cpu, <Cpu />)}
        {/* При выборе процессора кулер «отъезжает», чтобы его было видно */}
        <Explode active={activeCategory === "cpu"} offset={[0, 0, 0.6]}>
          {part("cooling", spec.cooler, cooler.kind === "air" ? <AirCooler heightMm={cooler.heightMm} /> : <AioPump />)}
        </Explode>
      </group>
      {cooler.kind === "aio" && (
        <group position={[0, 0.94, 0.02]}>{part("cooling", spec.cooler, <AioRadiator radiatorMm={cooler.radiatorMm} />)}</group>
      )}

      <group position={[layout.ram[0], layout.ram[1], BOARD_Z]}>{part("ram", spec.ram, <Ram sticks={ram.sticks} />)}</group>

      <group position={[layout.m2[0], layout.m2[1], BOARD_Z]}>{part("storage", spec.storage, <Storage gen={storage.gen} />)}</group>

      <group position={[GPU_BRACKET_X, layout.pcieY, BOARD_Z]}>
        {part("gpu", spec.gpu, <Gpu lengthMm={gpu.lengthMm} fans={gpu.fans} slots={gpu.slots} />)}
      </group>

      <group position={[-0.53, -0.88, -0.1]}>{part("psu", spec.psu, <Psu wattage={psu.wattage} />)}</group>
    </group>
  );
}
