"use client";

import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { useBuild } from "@/presentation/state/BuildContext";

type TabState = "done" | "conflict" | "warning" | "empty";

export function CategoryTabs() {
  const { activeCategory, focus, selection, summary } = useBuild();

  const stateOf = (category: ComponentCategory): TabState => {
    if (summary.conflictCategories.includes(category)) return "conflict";
    if (!selection[category]) return "empty";
    return summary.issues.some((i) => i.categories.includes(category)) ? "warning" : "done";
  };

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4" role="tablist" aria-label="Категории комплектующих">
      {COMPONENT_CATEGORIES.map((category) => (
        <button
          key={category}
          role="tab"
          aria-selected={category === activeCategory}
          data-state={stateOf(category)}
          className="relative grid min-w-0 gap-0.5 bg-surface/80 px-3.5 py-3 text-left transition-[background-color,box-shadow] duration-300 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-accent before:shadow-[0_0_12px_var(--glow)] before:transition-transform before:duration-300 before:content-[''] aria-selected:before:scale-x-100 after:absolute after:right-3.5 after:top-3.5 after:size-[7px] after:rounded-full after:content-[''] hover:bg-surface-2 aria-selected:bg-surface-2 data-[state=conflict]:after:bg-danger data-[state=conflict]:after:ring-3 data-[state=conflict]:after:ring-danger/25 data-[state=done]:after:bg-success data-[state=empty]:after:border data-[state=empty]:after:border-dashed data-[state=empty]:after:border-muted data-[state=warning]:after:bg-warning"
          onClick={() => focus(category)}
        >
          <span className="text-[13px] font-medium">{CATEGORY_LABELS[category]}</span>
          <span className="truncate text-xs opacity-60">{selection[category]?.name ?? "—"}</span>
        </button>
      ))}
    </div>
  );
}
