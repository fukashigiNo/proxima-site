import type { ComponentCategory, ComponentOf, PcComponent } from "./PcComponent";

/** Сборка — неизменяемый набор выбранных комплектующих; тип каждой ячейки сужен по категории. */
export type BuildSelection = { readonly [C in ComponentCategory]?: ComponentOf<C> };

export interface PresetBuild {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  readonly purpose: string;
  readonly componentIds: readonly string[];
}

/** Валидация текстовых полей готовой сборки. */
export function validatePresetFields(p: Pick<PresetBuild, "title" | "tagline" | "purpose">): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!p.title?.trim() || p.title.length > 40) errors.title = "Название обязательно, до 40 символов";
  if (!p.tagline?.trim() || p.tagline.length > 40) errors.tagline = "Подпись обязательна, до 40 символов";
  if (!p.purpose?.trim() || p.purpose.length > 120) errors.purpose = "Описание обязательно, до 120 символов";
  return errors;
}

export const selectComponent = (selection: BuildSelection, component: PcComponent): BuildSelection => ({
  ...selection,
  [component.category]: component,
});

export const removeCategory = (selection: BuildSelection, category: ComponentCategory): BuildSelection => {
  const { [category]: _removed, ...rest } = selection;
  return rest;
};

export const selectedComponents = (selection: BuildSelection): PcComponent[] =>
  Object.values(selection).filter((c): c is PcComponent => Boolean(c));
