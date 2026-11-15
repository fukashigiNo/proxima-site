"use client";

import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { useBuild } from "@/presentation/state/BuildContext";

type TabState = "done" | "conflict" | "warning" | "empty";

/** Шаги конструктора с индикатором состояния каждой категории. */
export function CategoryTabs() {
  const { activeCategory, focus, selection, summary } = useBuild();

  const stateOf = (category: ComponentCategory): TabState => {
    if (summary.conflictCategories.includes(category)) return "conflict";
    if (!selection[category]) return "empty";
    return summary.issues.some((i) => i.categories.includes(category)) ? "warning" : "done";
  };

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4" role="tablist" aria-label="Категории комплектующих">
      {COMPONENT_CATEGORIES.map((category, i) => (
        <button
          key={category}
          role="tab"
          aria-selected={category === activeCategory}
          data-state={stateOf(category)}
          className="relative grid min-w-0 gap-0.5 bg-bg px-3.5 py-3 text-left transition-colors after:absolute after:right-3.5 after:top-3.5 after:size-[7px] after:rounded-full after:content-[''] hover:bg-surface aria-selected:bg-ink aria-selected:text-bg data-[state=conflict]:after:bg-danger data-[state=conflict]:after:ring-3 data-[state=conflict]:after:ring-danger/25 data-[state=done]:after:bg-success data-[state=empty]:after:border data-[state=empty]:after:border-dashed data-[state=empty]:after:border-muted data-[state=warning]:after:bg-warning"
          onClick={() => focus(category)}
        >
          <span className="font-mono text-[11px] opacity-50">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-[13px] font-medium">{CATEGORY_LABELS[category]}</span>
          <span className="truncate text-xs opacity-60">{selection[category]?.name ?? "—"}</span>
        </button>
      ))}
    </div>
  );
}
