import type { BuildSelection } from "@/domain/entities/Build";
import type { FormFactor, PcComponent } from "@/domain/entities/PcComponent";

/**
 * Визуальное описание сборки — всё, что нужно 3D-слою, и ничего лишнего.
 * Отделяет рендер от доменных сущностей: модели не знают о ценах, сокетах и т.п.
 */
export interface CaseVisual { id: string; color: "black" | "white" }
export interface BoardVisual { id: string; formFactor: FormFactor }
export interface GpuVisual { id: string; lengthMm: number; fans: 2 | 3; slots: number }
export interface RamVisual { id: string; sticks: 2 | 4 }
export interface StorageVisual { id: string; gen: 4 | 5 }
export interface PsuVisual { id: string; wattage: number }
export type CoolerVisual =
  | { id: string; kind: "air"; heightMm: number }
  | { id: string; kind: "aio"; radiatorMm: number };

export interface PcVisualSpec {
  case: CaseVisual | null;
  board: BoardVisual | null;
  cpu: { id: string } | null;
  cooler: CoolerVisual | null;
  ram: RamVisual | null;
  gpu: GpuVisual | null;
  storage: StorageVisual | null;
  psu: PsuVisual | null;
}

/** Размеры «призраков» для ещё не выбранных деталей */
export const GHOST_SPEC: Required<{ [K in keyof PcVisualSpec]: NonNullable<PcVisualSpec[K]> }> = {
  case: { id: "ghost", color: "white" },
  board: { id: "ghost", formFactor: "ATX" },
  cpu: { id: "ghost" },
  cooler: { id: "ghost", kind: "air", heightMm: 155 },
  ram: { id: "ghost", sticks: 2 },
  gpu: { id: "ghost", lengthMm: 300, fans: 3, slots: 2.5 },
  storage: { id: "ghost", gen: 4 },
  psu: { id: "ghost", wattage: 750 },
};

export const toVisualSpec = ({ case: pcCase, motherboard, cpu, cooling, ram, gpu, storage, psu }: BuildSelection): PcVisualSpec => ({
  case: pcCase ? { id: pcCase.id, color: pcCase.color } : null,
  board: motherboard ? { id: motherboard.id, formFactor: motherboard.formFactor } : null,
  cpu: cpu ? { id: cpu.id } : null,
  cooler: cooling
    ? cooling.kind === "air"
      ? { id: cooling.id, kind: "air", heightMm: cooling.heightMm }
      : { id: cooling.id, kind: "aio", radiatorMm: cooling.radiatorMm }
    : null,
  ram: ram ? { id: ram.id, sticks: ram.sticks } : null,
  gpu: gpu ? { id: gpu.id, lengthMm: gpu.lengthMm, fans: gpu.fans, slots: gpu.slots } : null,
  storage: storage ? { id: storage.id, gen: storage.pcieGen } : null,
  psu: psu ? { id: psu.id, wattage: psu.wattage } : null,
});

/** Визуал одной детали — для инспектора. */
export const toComponentVisual = (component: PcComponent) =>
  toVisualSpec({ [component.category]: component } as BuildSelection);
