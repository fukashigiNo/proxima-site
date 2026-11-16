import type { FormFactor } from "@/domain/entities/PcComponent";

export const BOARD_Z = -0.445;
export const BOARD_ORIGIN: [number, number] = [-0.88, 1.0];
export const GPU_BRACKET_X = -0.86;

export interface BoardLayout {
  size: [number, number];
  socket: [number, number];
  ram: [number, number];
  pcieY: number;
  m2: [number, number];
}

export const BOARD_LAYOUTS: Record<FormFactor, BoardLayout> = {
  ATX: { size: [1.1, 1.37], socket: [-0.33, 0.55], ram: [0.08, 0.55], pcieY: 0.02, m2: [-0.33, 0.22] },
  mATX: { size: [1.1, 1.1], socket: [-0.33, 0.55], ram: [0.08, 0.55], pcieY: 0.02, m2: [-0.33, 0.22] },
  ITX: { size: [0.77, 0.77], socket: [-0.55, 0.68], ram: [-0.22, 0.68], pcieY: 0.3, m2: [-0.55, 0.45] },
};
