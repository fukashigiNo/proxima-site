export const PLANET_D = 0;
export const PLANET_B = 1;
export const PLANET_C = 2;

export type Shot =
  | { kind: "fixed"; position: [number, number, number]; target: [number, number, number] }
  | { kind: "planet"; planet: number; distance: number; height: number; side: number };

export const SHOTS: Shot[] = [
  { kind: "fixed", position: [2, 6.5, 15], target: [0, -0.4, 0] },
  { kind: "fixed", position: [0.6, 0.5, 3.4], target: [0, 0, 0] },
  { kind: "planet", planet: PLANET_D, distance: 1.25, height: 0.25, side: 0.7 },
  { kind: "planet", planet: PLANET_B, distance: 2.2, height: 0.4, side: 0.55 },
  { kind: "planet", planet: PLANET_B, distance: 2.3, height: 0.7, side: 1.75 },
  { kind: "planet", planet: PLANET_C, distance: 3.6, height: 0.8, side: 0.8 },
  { kind: "fixed", position: [16, 6, 24], target: [-24, 3, -36] },
];

export const SHOT_INFO: { name: string; fact: string }[] = [
  { name: "Система Проксимы Центавра", fact: "3 планеты · 4,24 светового года от Солнца" },
  { name: "Proxima Centauri", fact: "Красный карлик M5.5 · вспыхивающая звезда" },
  { name: "Proxima d", fact: "≈0,26 массы Земли · год длится 5,1 суток" },
  { name: "Proxima b", fact: "≈1,07 массы Земли · в зоне обитаемости · 11,2 суток" },
  { name: "Proxima b · терминатор", fact: "Приливный захват: одна сторона всегда к звезде" },
  { name: "Proxima c", fact: "Кандидат · ≈7 масс Земли · год ≈5 лет" },
  { name: "Альфа Центавра A и B", fact: "Проксима обращается вокруг них на ≈13 000 а. е." },
];
