import type { BuildSummary } from "@/application/use-cases/EvaluateBuild";
import type { BuildSelection } from "@/domain/entities/Build";
import { CATEGORY_LABELS, CITIES, CITY_LABELS, COMPONENT_CATEGORIES, stockIn, type PcComponent } from "@/domain/entities/PcComponent";

export const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const money = (value: number) => `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₸`;

export const partName = (c: PcComponent) => `${c.brand} ${c.name}`;

export const isAvailable = (c: PcComponent) => stockIn(c, "all") > 0;

export const stockLine = (c: PcComponent) =>
  c.outOfStock
    ? "нет в наличии"
    : CITIES.map((city) => `${CITY_LABELS[city]}: ${c.stock[city] ?? 0}`).join(" · ");

export function selectionLines(selection: BuildSelection) {
  return COMPONENT_CATEGORIES.flatMap((category) => {
    const part = selection[category];
    return part ? [`• ${CATEGORY_LABELS[category]}: ${esc(partName(part))} — ${money(part.price)}`] : [];
  });
}

export function summaryLines(summary: BuildSummary) {
  if (summary.partsPrice === 0) return [];
  const lines = [
    `Комплектующие: ${money(summary.partsPrice)}`,
    `Сборка и тест: ${money(summary.assemblyFee)}`,
    `<b>Итого: ${money(summary.total)}</b>`,
    `Потребление ≈ ${summary.powerDraw} Вт`,
  ];
  if (summary.isValid) lines.push("✅ Сборка полностью совместима");
  else {
    if (summary.missing.length) lines.push(`Не выбрано: ${summary.missing.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")}`);
    for (const issue of summary.issues.filter((i) => i.severity === "error")) lines.push(`⛔ ${esc(issue.message)}`);
  }
  for (const issue of summary.issues.filter((i) => i.severity === "warning")) lines.push(`⚠️ ${esc(issue.message)}`);
  return lines;
}

export const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
