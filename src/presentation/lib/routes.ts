import { selectedComponents, type BuildSelection } from "@/domain/entities/Build";
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";

const partsParam = (selection: BuildSelection) =>
  selectedComponents(selection)
    .map((c) => c.id)
    .join(",");

export function orderHref(selection: BuildSelection, title?: string | null) {
  const params = new URLSearchParams();
  const parts = partsParam(selection);
  if (parts) params.set("parts", parts);
  if (title) params.set("title", title);
  const query = params.toString();
  return query ? `/order?${query}` : "/order";
}

export function builderHref({
  preset,
  selection,
  focus,
}: {
  preset?: string;
  selection?: BuildSelection;
  focus?: ComponentCategory;
}) {
  const params = new URLSearchParams();
  if (preset) params.set("preset", preset);
  const parts = selection ? partsParam(selection) : "";
  if (parts) params.set("parts", parts);
  if (focus) params.set("focus", focus);
  const query = params.toString();
  return query ? `/builder?${query}` : "/builder";
}

export const parseParts = (raw?: string) => (raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []);

export const parseCategory = (raw?: string): ComponentCategory | undefined =>
  COMPONENT_CATEGORIES.find((c) => c === raw);

export const parseTitle = (raw?: string) => raw?.trim().slice(0, 80) || null;
