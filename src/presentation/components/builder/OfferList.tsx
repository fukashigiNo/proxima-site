"use client";

import { useMemo } from "react";
import { evaluateCandidate } from "@/application/use-cases/EvaluateBuild";
import { removeCategory } from "@/domain/entities/Build";
import { CITY_LABELS, stockIn, type City, type PcComponent } from "@/domain/entities/PcComponent";
import { formatPrice } from "@/presentation/lib/format";
import { useBuild } from "@/presentation/state/BuildContext";

interface Props {
  offers: PcComponent[];
  city: City | "all";
  onInspect: (component: PcComponent | null) => void;
}

const STATUS_TEXT = { ok: "Совместимо", warning: "С оговорками", error: "Несовместимо" } as const;

/** Список предложений: для каждого — динамическая проверка совместимости с текущей сборкой. */
export function OfferList({ offers, city, onInspect }: Props) {
  const { selection, activeCategory, select, remove } = useBuild();
  const current = selection[activeCategory];
  const rest = useMemo(() => removeCategory(selection, activeCategory), [selection, activeCategory]);

  if (offers.length === 0) {
    return <p className="rounded-panel border border-dashed border-line-strong p-8 text-center text-muted">Нет позиций в наличии{city !== "all" ? ` в г. ${CITY_LABELS[city]}` : ""}. Снимите фильтр или выберите другой город.</p>;
  }

  return (
    <div className="grid gap-2" role="radiogroup" onMouseLeave={() => onInspect(null)}>
      {offers.map((offer) => {
        const checked = current?.id === offer.id;
        const { status, reasons } = evaluateCandidate(rest, offer);
        const stock = stockIn(offer, city);
        return (
          <div
            key={offer.id}
            role="radio"
            tabIndex={0}
            aria-checked={checked}
            data-status={status}
            className="group grid cursor-pointer grid-cols-[auto_1fr] items-start gap-4 rounded-card border border-line bg-bg px-[18px] py-4 outline-none transition-[border-color,opacity] hover:border-line-strong focus-visible:border-line-strong aria-checked:border-ink aria-checked:shadow-[inset_0_0_0_1px_var(--ink)] data-[status=error]:aria-checked:border-danger data-[status=error]:aria-checked:shadow-[inset_0_0_0_1px_var(--danger)] data-[status=error]:not-aria-checked:opacity-60 sm:grid-cols-[auto_1fr_auto]"
            onMouseEnter={() => onInspect(offer)}
            onFocus={() => onInspect(offer)}
            onClick={() => (checked ? remove(offer.category) : select(offer))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (checked) remove(offer.category);
                else select(offer);
              }
            }}
          >
            <span className="mt-0.5 size-[18px] rounded-full border-[1.5px] border-line-strong transition-[border] group-aria-checked:border-[5px] group-aria-checked:border-accent" aria-hidden />
            <div className="grid min-w-0 gap-1">
              <p className="text-[15px] font-medium">
                <span className="font-normal text-muted">{offer.brand}</span> {offer.name}
              </p>
              <p className="text-[13px] text-muted">{Object.values(offer.specs).join(" · ")}</p>
              {status !== "ok" && (
                <ul className="mt-1 grid list-none gap-0.5 text-xs group-data-[status=error]:text-danger group-data-[status=warning]:text-warning-ink">
                  {reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-start-2 grid justify-items-start gap-[3px] text-left sm:col-start-auto sm:justify-items-end sm:text-right">
              <p className="whitespace-nowrap font-mono text-sm">{formatPrice(offer.price)}</p>
              <p className="text-[11px] uppercase tracking-[0.04em] text-success group-data-[status=error]:text-danger group-data-[status=warning]:text-warning-ink">{STATUS_TEXT[status]}</p>
              <p className="whitespace-nowrap text-xs text-muted data-empty:opacity-70" data-empty={stock === 0 || undefined}>
                {stock > 0 ? `в наличии ${stock} шт.` : "под заказ 3–7 дней"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
