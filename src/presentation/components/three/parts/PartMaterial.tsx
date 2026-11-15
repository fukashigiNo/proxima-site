"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, type MeshStandardMaterial } from "three";
import { SCENE_COLORS } from "../theme";
import { usePartState } from "./PartContext";

interface Props {
  color: string;
  metalness?: number;
  roughness?: number;
  /** Постоянное свечение в состоянии покоя (RGB-элементы) */
  glow?: number;
}

const ACCENT = new Color(SCENE_COLORS.accent);
const ERROR = new Color(SCENE_COLORS.error);

/** Материал детали: реагирует на состояние из PartContext (активна / конфликт / не выбрана). */
/**
 * Без карты окружения металл выглядит чёрным (ему нечего отражать),
 * поэтому металличность приглушается — освещение даёт полусферный свет.
 */
const METALNESS_SCALE = 0.35;

export function PartMaterial({ color, metalness = 0.4, roughness = 0.5, glow = 0 }: Props) {
  const { status, ghost } = usePartState();
  const ref = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }, delta) => {
    const material = ref.current;
    if (!material) return;
    // В покое (без подсветки и уже на целевом значении) кадр пропускается — сотни материалов не тратят CPU
    const e = material.emissive;
    const settled =
      Math.abs(material.emissiveIntensity - glow) < 0.002 &&
      Math.abs(e.r - ACCENT.r) + Math.abs(e.g - ACCENT.g) + Math.abs(e.b - ACCENT.b) < 0.003;
    if (status === "idle" && settled) return;
    const t = Math.min(1, delta * 6);
    const wave = Math.sin(clock.elapsedTime * (status === "error" ? 5 : 3));
    const target = status === "error" ? 0.45 + wave * 0.2 : status === "active" ? 0.55 + wave * 0.2 : glow;
    material.emissiveIntensity += (target - material.emissiveIntensity) * t;
    material.emissive.lerp(status === "error" ? ERROR : ACCENT, t);
  });

  if (ghost) {
    return (
      <meshStandardMaterial
        key="ghost"
        ref={ref}
        color={SCENE_COLORS.ghost}
        transparent
        opacity={0.16}
        depthWrite={false}
        emissive={ACCENT}
        emissiveIntensity={0}
      />
    );
  }

  return (
    <meshStandardMaterial
      key="solid"
      ref={ref}
      color={color}
      metalness={metalness * METALNESS_SCALE}
      roughness={roughness}
      emissive={ACCENT}
      emissiveIntensity={glow}
    />
  );
}

/** Светящаяся RGB-полоса — гаснет у «призраков». */
export function GlowStrip({ args, position }: { args: [number, number, number]; position?: [number, number, number] }) {
  const { ghost } = usePartState();
  if (ghost) return null;
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={SCENE_COLORS.accent} emissive={SCENE_COLORS.accent} emissiveIntensity={1.6} />
    </mesh>
  );
}
