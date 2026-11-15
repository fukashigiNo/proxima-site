"use client";

import { CITIES, CITY_LABELS, stockIn, type City, type PcComponent } from "@/domain/entities/PcComponent";
import { formatPrice } from "@/presentation/lib/format";
import { ComponentPreviewLazy } from "../three/ComponentPreviewLazy";

/** Карточка-инспектор: 3D-модель комплектующего, характеристики и наличие по городам. */
export function Inspector({ component, city }: { component: PcComponent; city: City | "all" }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-panel border border-line bg-bg sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" aria-label={`Просмотр: ${component.name}`}>
      <ComponentPreviewLazy component={component} className="bg-surface min-h-[240px] sm:min-h-[280px]" />
      <div className="grid content-start gap-2.5 px-6 py-[22px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">{component.brand}</p>
        <h3 className="text-[22px] font-medium leading-tight tracking-[-0.02em]">{component.name}</h3>
        <dl className="grid gap-1.5 border-y border-line py-2.5 text-[13px] [&>div]:flex [&>div]:justify-between [&>div]:gap-3 [&_dd]:text-right [&_dt]:text-muted">
          {Object.entries(component.specs).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {component.powerDraw > 0 && (
            <div>
              <dt>Потребление</dt>
              <dd>{component.powerDraw} Вт</dd>
            </div>
          )}
        </dl>
        <ul className="grid list-none gap-1 text-[13px]">
          {CITIES.map((c) => {
            const count = stockIn(component, c);
            return (
              <li
                key={c}
                className="flex justify-between text-muted data-highlight:font-medium data-highlight:text-ink data-empty:[&>span:last-child]:opacity-60"
                data-highlight={city === c || undefined} data-empty={count === 0 || undefined}>
                <span>{CITY_LABELS[c]}</span>
                <span>{count > 0 ? `${count} шт.` : "под заказ"}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-2xl font-medium tracking-[-0.02em]">{formatPrice(component.price)}</p>
      </div>
    </section>
  );
}
