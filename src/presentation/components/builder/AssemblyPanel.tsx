"use client";

import { useMemo } from "react";
import { CATEGORY_LABELS } from "@/domain/entities/PcComponent";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { AnimatedNumber } from "../motion/AnimatedNumber";
import { PcSceneLazy } from "../three/PcSceneLazy";
import { toVisualSpec } from "../three/visualSpec";
import { OrderButton } from "../order/OrderButton";
import { Button } from "../ui/Button";
import { Label } from "../ui/Layout";

const CHECK =
  "block w-full rounded-[10px] py-2.5 pl-8 pr-3.5 text-left text-sm leading-snug relative before:absolute before:left-3.5 before:top-4 before:size-[7px] before:rounded-full before:bg-current before:content-[''] hover:bg-surface";

export function AssemblyPanel() {
  const { selection, summary, activeCategory, focus, presetTitle } = useBuild();
  const spec = useMemo(() => toVisualSpec(selection), [selection]);
  const errors = summary.issues.filter((i) => i.severity === "error");
  const warnings = summary.issues.filter((i) => i.severity === "warning");
  const psuLoad = selection.psu ? Math.min(100, Math.round((summary.powerDraw / selection.psu.wattage) * 100)) : null;

  return (
    <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:sticky lg:top-[84px]">
      <div className="relative">
        <PcSceneLazy
          className="h-[380px] rounded-panel bg-surface/50 lg:h-[min(56vh,520px)] lg:min-h-[360px]"
          spec={spec}
          conflicts={summary.conflictCategories}
          activeCategory={activeCategory}
          onPartSelect={focus}
          autoRotate={false}
        />
        <div className="pointer-events-none absolute bottom-3.5 left-4 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-muted [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5">
          <span><i className="size-2 rounded-full bg-accent" /> выбрано</span>
          <span><i className="size-2 rounded-full bg-danger" /> конфликт</span>
          <span><i className="size-2 rounded-full border border-dashed border-muted" /> не выбрано</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-panel border border-line bg-surface/70 px-6 py-5 sm:grid-cols-[1.3fr_1fr]">
        <div>
          <Label>{presetTitle ?? "Своя конфигурация"}</Label>
          <p className="text-[32px] font-semibold tracking-[-0.03em]">
            <AnimatedNumber value={summary.total} format={formatPrice} />
          </p>
          <p className="text-[13px] text-muted">включая сборку и тест {formatPrice(summary.assemblyFee)}</p>
        </div>
        <div>
          <Label>Потребление</Label>
          <p className="text-[22px] font-semibold tracking-[-0.02em]">
            <AnimatedNumber value={summary.powerDraw} format={formatWatts} />
          </p>
          {psuLoad !== null && (
            <div className="my-1.5 h-1 overflow-hidden rounded bg-line" aria-label={`Нагрузка на БП ${psuLoad}%`}>
              <span
                className="block h-full bg-success transition-[width] duration-500 data-high:bg-accent"
                style={{ width: `${psuLoad}%` }}
                data-high={psuLoad > 77 || undefined}
              />
            </div>
          )}
          <p className="text-[13px] text-muted">БП от {formatWatts(summary.recommendedPsu)}</p>
        </div>
      </div>

      <ul className="grid list-none gap-1.5" aria-live="polite">
        {errors.map((issue) => (
          <li key={issue.rule} className="animate-rise rounded-[10px] bg-danger/8 text-danger">
            <button className={CHECK} onClick={() => focus(issue.categories[0])}>{issue.message}</button>
          </li>
        ))}
        {warnings.map((issue) => (
          <li key={issue.rule} className="animate-rise rounded-[10px] bg-warning/12 text-warning-ink">
            <button className={CHECK} onClick={() => focus(issue.categories[0])}>{issue.message}</button>
          </li>
        ))}
        {summary.missing.map((category) => (
          <li key={category} className="rounded-[10px] text-muted">
            <button className={CHECK} onClick={() => focus(category)}>Выберите: {CATEGORY_LABELS[category].toLowerCase()}</button>
          </li>
        ))}
        {summary.isValid && warnings.length === 0 && <li className="animate-rise rounded-[10px] bg-success/8 px-3.5 py-2.5 text-sm text-success">Сборка полностью совместима</li>}
      </ul>

      {summary.isValid ? (
        <OrderButton selection={selection} title={presetTitle} />
      ) : (
        <Button disabled>{summary.missing.length > 0 ? "Выберите все комплектующие" : "Исправьте конфликты, чтобы оформить"}</Button>
      )}
    </aside>
  );
}
