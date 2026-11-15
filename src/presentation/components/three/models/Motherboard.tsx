"use client";

import type { FormFactor } from "@/domain/entities/PcComponent";
import { BOARD_LAYOUTS, BOARD_ORIGIN } from "../layout";
import { PartMaterial } from "../parts/PartMaterial";
import { SCENE_COLORS as C } from "../theme";

/** Плата, начало координат — верхний задний угол на плоскости платы. */
export function Motherboard({ formFactor }: { formFactor: FormFactor }) {
  const { size, socket, ram, pcieY, m2 } = BOARD_LAYOUTS[formFactor];
  const [w, h] = size;
  // Переводим точки крепления из координат корпуса в локальные
  const local = ([x, y]: [number, number]): [number, number] => [x - BOARD_ORIGIN[0], y - BOARD_ORIGIN[1]];
  const [sx, sy] = local(socket);
  const [rx, ry] = local(ram);
  const [mx, my] = local(m2);

  return (
    <group>
      <mesh position={[w / 2, -h / 2, 0]}>
        <boxGeometry args={[w, h, 0.03]} />
        <PartMaterial color={C.pcb} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Радиаторы VRM вокруг сокета */}
      <mesh position={[sx - 0.3, sy + 0.05, 0.05]}>
        <boxGeometry args={[0.12, 0.5, 0.08]} />
        <PartMaterial color={C.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[sx, sy + 0.3, 0.05]}>
        <boxGeometry args={[0.45, 0.1, 0.08]} />
        <PartMaterial color={C.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Сокет */}
      <mesh position={[sx, sy, 0.02]}>
        <boxGeometry args={[0.24, 0.24, 0.02]} />
        <PartMaterial color="#3a3a3f" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Слоты памяти */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[rx + i * 0.055, ry, 0.02]}>
          <boxGeometry args={[0.02, 0.62, 0.02]} />
          <PartMaterial color="#2b2b30" roughness={0.6} />
        </mesh>
      ))}
      {/* Слот PCIe */}
      <mesh position={[0.45, pcieY - BOARD_ORIGIN[1], 0.02]}>
        <boxGeometry args={[0.6, 0.03, 0.03]} />
        <PartMaterial color="#2b2b30" roughness={0.6} />
      </mesh>
      {/* Радиатор M.2 и чипсета */}
      <mesh position={[mx, my, 0.02]}>
        <boxGeometry args={[0.38, 0.11, 0.015]} />
        <PartMaterial color="#26262b" metalness={0.6} roughness={0.4} />
      </mesh>
      {formFactor !== "ITX" && (
        <mesh position={[w - 0.3, -h + 0.35, 0.03]}>
          <boxGeometry args={[0.28, 0.28, 0.05]} />
          <PartMaterial color={C.metal} metalness={0.8} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}
