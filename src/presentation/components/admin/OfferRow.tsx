"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { setAvailability, updateOffer, type ActionState } from "@/app/admin/actions";
import { CITIES, CITY_LABELS, warehouseStock, type PcComponent } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";

const INPUT =
  "h-9 w-full rounded-lg border border-line bg-bg px-2.5 text-right font-mono text-sm text-ink outline-none transition-colors focus:border-ink aria-invalid:border-danger";

export function OfferRow({ component }: { component: PcComponent }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOffer, {});
  const [dirty, setDirty] = useState(false);
  const [availability, toggle, toggling] = useActionState<ActionState, FormData>(setAvailability, {});
  const outOfStock = component.outOfStock === true;

  const flip = () => {
    const data = new FormData();
    data.set("id", component.id);
    data.set("available", outOfStock ? "1" : "0");
    startTransition(() => toggle(data));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };

  useEffect(() => {
    if (state.ok) setDirty(false);
  }, [state]);

  const stockTotal = warehouseStock(component);

  return (
    <form
      onSubmit={submit}
      onChange={() => setDirty(true)}
      className={cn(
        "grid grid-cols-2 items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,2.2fr)_120px_repeat(3,72px)_110px]",
        dirty && "bg-accent/5",
      )}
    >
      <input type="hidden" name="id" value={component.id} />
      <div className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface-2">
          {component.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={component.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-contain p-1" />
          ) : (
            <span className="text-[10px] text-muted">нет фото</span>
          )}
        </span>
        <div className="min-w-0">
          <Link href={`/admin/catalog/${component.id}`} className="block truncate text-sm font-medium text-ink no-underline hover:text-accent">
            <span className="font-normal text-muted">{component.brand}</span> {component.name}
          </Link>
          <p className="flex flex-wrap items-center gap-x-2 text-xs">
            <button
              type="button"
              onClick={flip}
              disabled={toggling}
              title={outOfStock ? "Вернуть в продажу" : "Отметить «нет в наличии»"}
              className={cn(
                "rounded-full px-2 py-0.5 font-medium transition-colors disabled:opacity-50",
                outOfStock ? "bg-danger/12 text-danger hover:bg-danger/20" : "bg-success/12 text-success hover:bg-success/20",
              )}
            >
              {toggling ? "…" : outOfStock ? "Нет в наличии" : "В наличии"}
            </button>
            <span className={cn(stockTotal === 0 ? "text-danger" : stockTotal < 3 ? "text-warning-ink" : "text-muted")}>
              {stockTotal === 0 ? "остатков нет" : `на складах ${stockTotal} шт.`}
            </span>
            <span className="text-muted">· {component.id}</span>
            {availability.message && !availability.ok && <span className="text-danger">{availability.message}</span>}
          </p>
        </div>
      </div>
      <label className="grid gap-1 md:block">
        <span className="text-[11px] text-muted md:sr-only">Цена, ₸</span>
        <input name="price" inputMode="numeric" defaultValue={component.price} aria-invalid={Boolean(state.fields?.price)} aria-label="Цена, ₸" className={INPUT} />
      </label>
      {CITIES.map((city) => (
        <label key={city} className="grid gap-1 md:block">
          <span className="text-[11px] text-muted md:sr-only">{CITY_LABELS[city]}</span>
          <input
            name={`stock.${city}`}
            inputMode="numeric"
            defaultValue={component.stock[city] ?? 0}
            aria-invalid={Boolean(state.fields?.[`stock.${city}`])}
            aria-label={`Остаток: ${CITY_LABELS[city]}`}
            className={INPUT}
          />
        </label>
      ))}
      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
        {state.message && (!state.ok || !dirty) && (
          <span className={cn("text-xs", state.ok ? "text-success" : "text-danger")}>{state.message}</span>
        )}
        <button
          type="submit"
          disabled={!dirty || pending}
          className="h-9 rounded-full bg-ink px-4 text-[13px] text-bg transition-colors hover:bg-accent disabled:opacity-30"
        >
          {pending ? "…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
