import type { PcComponent } from "@/domain/entities/PcComponent";

export function technicalDetails(c: PcComponent): [string, string][] {
  const rows: [string, string][] = [];
  switch (c.category) {
    case "cpu":
      rows.push(["Сокет", c.socket]);
      break;
    case "motherboard":
      rows.push(["Сокет", c.socket], ["Память", c.memoryType], ["Форм-фактор", c.formFactor], ["M.2 PCIe 5.0", c.pcieGen5M2 ? "есть" : "нет"]);
      break;
    case "gpu":
      rows.push(["Длина", `${c.lengthMm} мм`], ["Толщина", `${c.slots} слота`], ["Вентиляторы", String(c.fans)], ["Питание", c.powerConnector]);
      break;
    case "ram":
      rows.push(["Тип", c.memoryType], ["Модулей", String(c.sticks)]);
      break;
    case "storage":
      rows.push(["Интерфейс", `PCIe ${c.pcieGen}.0`]);
      break;
    case "cooling":
      rows.push(
        ["Тип", c.kind === "air" ? "Башенный кулер" : "СЖО"],
        c.kind === "air" ? ["Высота", `${c.heightMm} мм`] : ["Радиатор", `${c.radiatorMm} мм`],
        ["Рассеивание", `${c.capacityW} Вт`],
      );
      break;
    case "psu":
      rows.push(["Мощность", `${c.wattage} Вт`], ["Разъём 12V-2x6", c.native12V2x6 ? "есть" : "нет"]);
      break;
    case "case":
      rows.push(
        ["Платы", c.formFactors.join(", ")],
        ["Макс. длина видеокарты", `${c.maxGpuLengthMm} мм`],
        ["Макс. высота кулера", `${c.maxCoolerHeightMm} мм`],
        ["Радиаторы СЖО", c.radiatorsMm.length ? c.radiatorsMm.map((r) => `${r}`).join(", ") + " мм" : "нет"],
        ["Цвет", c.color === "white" ? "белый" : "чёрный"],
      );
      break;
  }
  if (c.powerDraw > 0) rows.push(["Потребление", `до ${c.powerDraw} Вт`]);
  const shown = new Set(rows.map(([k]) => k));
  return [...Object.entries(c.specs).filter(([k]) => !shown.has(k)), ...rows];
}
