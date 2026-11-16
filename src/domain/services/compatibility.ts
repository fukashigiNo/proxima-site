import { selectComponent, selectedComponents, type BuildSelection } from "../entities/Build";
import { COMPONENT_CATEGORIES, type ComponentCategory, type PcComponent } from "../entities/PcComponent";

export type IssueSeverity = "error" | "warning";

export interface CompatibilityIssue {
  readonly rule: string;
  readonly severity: IssueSeverity;
  readonly message: string;
  readonly categories: readonly ComponentCategory[];
}

export const PSU_HEADROOM = 1.3;
const BASE_SYSTEM_DRAW = 75;

export const estimatePowerDraw = (selection: BuildSelection): number =>
  selectedComponents(selection)
    .filter((c) => c.category !== "psu")
    .reduce((sum, c) => sum + c.powerDraw, BASE_SYSTEM_DRAW);

export const totalPrice = (selection: BuildSelection): number =>
  selectedComponents(selection).reduce((sum, c) => sum + c.price, 0);

export const missingCategories = (selection: BuildSelection): ComponentCategory[] =>
  COMPONENT_CATEGORIES.filter((category) => !selection[category]);

type Rule = (selection: BuildSelection) => CompatibilityIssue | null;

const issue = (
  rule: string,
  severity: IssueSeverity,
  categories: ComponentCategory[],
  message: string,
): CompatibilityIssue => ({ rule, severity, categories, message });

const RULES: readonly Rule[] = [
  ({ cpu, motherboard }) =>
    cpu && motherboard && cpu.socket !== motherboard.socket
      ? issue("socket", "error", ["cpu", "motherboard"], `Сокет процессора ${cpu.socket} ≠ сокет платы ${motherboard.socket}`)
      : null,

  ({ ram, motherboard }) =>
    ram && motherboard && ram.memoryType !== motherboard.memoryType
      ? issue("memory", "error", ["ram", "motherboard"], `Плата поддерживает ${motherboard.memoryType}, выбрана память ${ram.memoryType}`)
      : null,

  ({ motherboard, case: pcCase }) =>
    motherboard && pcCase && !pcCase.formFactors.includes(motherboard.formFactor)
      ? issue("form-factor", "error", ["motherboard", "case"], `Плата ${motherboard.formFactor} не помещается в корпус (${pcCase.formFactors.join(", ")})`)
      : null,

  ({ gpu, case: pcCase }) =>
    gpu && pcCase && gpu.lengthMm > pcCase.maxGpuLengthMm
      ? issue("gpu-length", "error", ["gpu", "case"], `Видеокарта ${gpu.lengthMm} мм длиннее допустимых ${pcCase.maxGpuLengthMm} мм`)
      : null,

  ({ cooling, case: pcCase }) => {
    if (!cooling || !pcCase) return null;
    if (cooling.kind === "air" && cooling.heightMm > pcCase.maxCoolerHeightMm)
      return issue("cooler-height", "error", ["cooling", "case"], `Кулер ${cooling.heightMm} мм выше допустимых ${pcCase.maxCoolerHeightMm} мм`);
    if (cooling.kind === "aio" && !pcCase.radiatorsMm.includes(cooling.radiatorMm))
      return issue("radiator", "error", ["cooling", "case"], `Корпус не поддерживает радиатор ${cooling.radiatorMm} мм`);
    return null;
  },

  ({ cpu, cooling }) =>
    cpu && cooling && cooling.capacityW < cpu.powerDraw
      ? issue("cooling-capacity", "warning", ["cpu", "cooling"], `Охлаждение рассчитано на ${cooling.capacityW} Вт — процессору нужно ${cpu.powerDraw} Вт`)
      : null,

  (selection) => {
    const { psu } = selection;
    if (!psu) return null;
    const required = Math.ceil(estimatePowerDraw(selection) * PSU_HEADROOM);
    return psu.wattage < required
      ? issue("psu-power", "error", ["psu", "gpu", "cpu"], `Блоку питания не хватает мощности: нужно от ${required} Вт, выбран ${psu.wattage} Вт`)
      : null;
  },

  ({ gpu, psu }) =>
    gpu && psu && gpu.powerConnector === "12V-2x6" && !psu.native12V2x6
      ? issue("psu-connector", "warning", ["gpu", "psu"], "У БП нет разъёма 12V‑2x6 — понадобится переходник")
      : null,

  ({ storage, motherboard }) =>
    storage && motherboard && storage.pcieGen === 5 && !motherboard.pcieGen5M2
      ? issue("m2-gen", "warning", ["storage", "motherboard"], "Плата без PCIe 5.0 M.2 — SSD будет работать на скорости PCIe 4.0")
      : null,

  ({ ram }) =>
    ram && ram.memoryType === "DDR5" && ram.sticks === 4
      ? issue("ram-sticks", "warning", ["ram"], "4 модуля DDR5 обычно работают на пониженной частоте")
      : null,
];

export const checkCompatibility = (selection: BuildSelection): CompatibilityIssue[] =>
  RULES.map((rule) => rule(selection)).filter((i): i is CompatibilityIssue => i !== null);

export const issuesForCandidate = (selection: BuildSelection, candidate: PcComponent): CompatibilityIssue[] =>
  checkCompatibility(selectComponent(selection, candidate)).filter((i) => i.categories.includes(candidate.category));
