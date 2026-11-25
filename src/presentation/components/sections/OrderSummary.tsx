"use client";

import { useRef } from "react";
import type { Catalog } from "@/application/use-cases/GetCatalog";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";
import { BuildPicker } from "../order/BuildPicker";
import { PartPicker, type PartPickerHandle } from "../order/PartPicker";
import { Button, LinkButton } from "../ui/Button";
import { Label } from "../ui/Layout";

export function OrderSummary({ presets = [], catalog }: { presets?: readonly PresetBuildView[]; catalog: Catalog }) {
  const picker = useRef<PartPickerHandle>(null);
  return (
    <>
      <SummaryCard presets={presets} onPick={(category) => picker.current?.open(category)} />
      <PartPicker ref={picker} catalog={catalog} />
    </>
  );
}

function SummaryCard({ presets, onPick }: { presets: readonly PresetBuildView[]; onPick: (category?: ComponentCategory) => void }) {
  const { selection, summary, presetTitle, reset } = useBuild();
  const hasParts = COMPONENT_CATEGORIES.some((c) => selection[c]);

  if (!hasParts) {
    return (
      <div className="grid content-start gap-4 rounded-panel border border-dashed border-line-strong p-6 md:p-9">
        <Label>Конфигурация не выбрана</Label>
        <p className="leading-relaxed text-muted">
          Можно просто описать задачу — подберём комплектующие сами. Или выберите готовую сборку либо соберите свою, и она
          приложится к заявке.
        </p>
        <div className="flex flex-wrap gap-2">
          <BuildPicker presets={presets} />
          <Button type="button" variant="ghost" onClick={() => onPick("cpu")}>Собрать здесь</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-5 rounded-panel border border-line bg-surface/70 p-6 md:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-medium tracking-[-0.02em]">{presetTitle ?? "Своя конфигурация"}</h2>
        <button type="button" onClick={reset} className="whitespace-nowrap text-sm text-muted transition-colors hover:text-ink">
          Изменить
        </button>
      </div>
      <div className="-mt-2">
        <BuildPicker presets={presets} label="Выбрать другую сборку" />
      </div>
      <dl className="grid gap-1 border-y border-line py-4 text-[15px]">
        {COMPONENT_CATEGORIES.map((category) => {
          const part = selection[category];
          return (
            <div key={category} className="group relative -mx-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 rounded-[10px] px-3 py-1.5 transition-colors hover:bg-surface-2">
              <dt className="col-span-2 flex items-center justify-between text-[13px] text-muted">
                <button type="button" onClick={() => onPick(category)} className="text-left after:absolute after:inset-0 after:content-['']">
                  {CATEGORY_LABELS[category]}
                </button>
                <span className="text-[12px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" aria-hidden>
                  {part ? "заменить" : "выбрать"} →
                </span>
              </dt>
              <dd className="truncate">{part ? `${part.brand} ${part.name}` : <span className="text-accent">выбрать</span>}</dd>
              <dd className="font-mono text-sm text-muted">{part ? formatPrice(part.price) : "—"}</dd>
            </div>
          );
        })}
      </dl>
      <div className="grid gap-1">
        <p className="text-[34px] font-semibold tracking-[-0.03em]">{formatPrice(summary.total)}</p>
        <p className="text-[13px] text-muted">
          комплектующие {formatPrice(summary.partsPrice)} + сборка {formatPrice(summary.assemblyFee)} · ≈ {formatWatts(summary.powerDraw)}
        </p>
      </div>
      {summary.isValid ? (
        <p className="rounded-[10px] bg-success/8 px-3.5 py-2.5 text-sm text-success">Сборка полностью совместима</p>
      ) : (
        <ul className="grid gap-1.5 text-sm">
          {summary.missing.length > 0 && (
            <li className="text-muted">Не выбрано: {summary.missing.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")}</li>
          )}
          {summary.issues
            .filter((i) => i.severity === "error")
            .map((issue) => (
              <li key={issue.rule} className="text-danger">{issue.message}</li>
            ))}
        </ul>
      )}
    </div>
  );
}
