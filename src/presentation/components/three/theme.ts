/** Цвета 3D-сцены синхронизированы с дизайн-токенами сайта. */
export const SCENE_COLORS = {
  accent: "#ff4f1f",
  error: "#e5241b",
  chassisWhite: "#e9e9e5",
  chassisBlack: "#202023",
  dark: "#1c1c1f",
  pcb: "#17171a",
  metal: "#9a9aa0",
  fin: "#c9c9ce",
  ghost: "#8f8f8a",
} as const;

/** 1 единица сцены ≈ 222 мм (корпус Mid‑Tower ≈ 2 единицы в глубину). */
export const MM = 1 / 222;
