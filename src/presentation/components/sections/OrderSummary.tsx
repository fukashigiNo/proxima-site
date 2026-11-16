"use client";

import Link from "next/link";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";
import { useBuild } from "@/presentation/state/BuildContext";
import { LinkButton } from "../ui/Button";
import { Label } from "../ui/Layout";

export function OrderSummary() {
  const { selection, summary, presetTitle } = useBuild();
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
          <LinkButton href="/builds" variant="ghost">Готовые сборки</LinkButton>
          <LinkButton href="/builder" variant="ghost">Конструктор</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-5 hud-frame rounded-panel border border-line bg-surface/70 p-6 md:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-medium tracking-[-0.02em]">{presetTitle ?? "Своя конфигурация"}</h2>
        <Link href={builderHref({ selection })} className="whitespace-nowrap text-sm text-muted hover:text-ink">
          Изменить →
        </Link>
      </div>
      <dl className="grid gap-3 border-y border-line py-5 text-[15px]">
        {COMPONENT_CATEGORIES.map((category) => {
          const part = selection[category];
          return (
            <div key={category} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5">
              <dt className="col-span-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted">{CATEGORY_LABELS[category]}</dt>
              <dd className="truncate">{part ? `${part.brand} ${part.name}` : <span className="text-muted">не выбрано</span>}</dd>
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
