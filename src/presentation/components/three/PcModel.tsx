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
import { ScrollExplode as X } from "./parts/ScrollExplode";
import { GHOST_SPEC, type PcVisualSpec } from "./visualSpec";

export interface PcModelProps {
  spec: PcVisualSpec;
  activeCategory?: ComponentCategory | null;
  conflicts?: readonly ComponentCategory[];
  onPartSelect?: (category: ComponentCategory) => void;
  onPartHover?: (category: ComponentCategory | null) => void;
}

export function PcModel({ spec, activeCategory, conflicts = [], onPartSelect, onPartHover }: PcModelProps) {
  const board = spec.board ?? GHOST_SPEC.board;
  const layout = BOARD_LAYOUTS[board.formFactor];
  const cooler = spec.cooler ?? GHOST_SPEC.cooler;
  const gpu = spec.gpu ?? GHOST_SPEC.gpu;
  const ram = spec.ram ?? GHOST_SPEC.ram;
  const storage = spec.storage ?? GHOST_SPEC.storage;
  const psu = spec.psu ?? GHOST_SPEC.psu;
  const pcCase = spec.case ?? GHOST_SPEC.case;

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
      <X offset={[0, 0, -0.55]} start={0}>
        {part("case", spec.case, <CaseShell color={pcCase.color} />)}
      </X>

      <group position={[BOARD_ORIGIN[0], BOARD_ORIGIN[1], BOARD_Z]}>
        <X offset={[0, 0, 0.2]} start={0.05}>
          {part("motherboard", spec.board, <Motherboard formFactor={board.formFactor} />)}
        </X>
      </group>

      <group position={[layout.socket[0], layout.socket[1], BOARD_Z]}>
        <X offset={[0, 0.12, 0.75]} start={0.12}>
          {part("cpu", spec.cpu, <Cpu />)}
          <Explode active={activeCategory === "cpu"} offset={[0, 0, 0.6]}>
            <X offset={[0, 0.35, 0.65]} start={0.2}>
              {part("cooling", spec.cooler, cooler.kind === "air" ? <AirCooler heightMm={cooler.heightMm} /> : <AioPump />)}
            </X>
          </Explode>
        </X>
      </group>
      {cooler.kind === "aio" && (
        <group position={[0, 0.94, 0.02]}>
          <X offset={[0, 0.55, 0.55]} start={0.2}>
            {part("cooling", spec.cooler, <AioRadiator radiatorMm={cooler.radiatorMm} />)}
          </X>
        </group>
      )}

      <group position={[layout.ram[0], layout.ram[1], BOARD_Z]}>
        <X offset={[0.05, 0.3, 0.9]} start={0.28}>
          {part("ram", spec.ram, <Ram sticks={ram.sticks} />)}
        </X>
      </group>

      <group position={[layout.m2[0], layout.m2[1], BOARD_Z]}>
        <X offset={[0.25, -0.05, 1]} start={0.34}>
          {part("storage", spec.storage, <Storage gen={storage.gen} />)}
        </X>
      </group>

      <group position={[GPU_BRACKET_X, layout.pcieY, BOARD_Z]}>
        <X offset={[0.3, -0.4, 1.25]} start={0.4}>
          {part("gpu", spec.gpu, <Gpu lengthMm={gpu.lengthMm} fans={gpu.fans} slots={gpu.slots} />)}
        </X>
      </group>

      <group position={[-0.53, -0.88, -0.1]}>
        <X offset={[-0.25, -0.45, 0.85]} start={0.45}>
          {part("psu", spec.psu, <Psu wattage={psu.wattage} />)}
        </X>
      </group>
    </group>
  );
}
