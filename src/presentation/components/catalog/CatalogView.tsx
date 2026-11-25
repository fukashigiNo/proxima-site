"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  EMPTY_QUERY,
  catalogFacets,
  categoryCounts,
  filterCatalog,
  priceBounds,
  type CatalogQuery,
  type CatalogSort,
} from "@/application/use-cases/FilterCatalog";
import type { BuildSelection } from "@/domain/entities/Build";
import { CATEGORY_LABELS, CITIES, CITY_LABELS, COMPONENT_CATEGORIES, stockIn, type City, type PcComponent } from "@/domain/entities/PcComponent";
import { serializeCatalogQuery } from "@/presentation/lib/catalogQuery";
import { cn } from "@/presentation/lib/cn";
import { formatPrice } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";
import { useOrderModal } from "../order/OrderModal";
import { ProductPhoto } from "./ProductPhoto";

const PAGE = 24;
const FIELD = "h-10 rounded-full border border-line-strong bg-surface/70 px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

export function CatalogView({ items, initialQuery }: { items: readonly PcComponent[]; initialQuery: CatalogQuery }) {
  const [query, setQuery] = useState<CatalogQuery>(initialQuery);
  const [limit, setLimit] = useState(PAGE);
  const deferred = useDeferredValue(query);
  const tabs = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tab = tabs.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (tab && tabs.current) tabs.current.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" });
  }, [query.category]);

  const results = useMemo(() => filterCatalog(items, deferred), [items, deferred]);
  const { brands, facets } = useMemo(() => catalogFacets(items, deferred), [items, deferred]);
  const counts = useMemo(() => categoryCounts(items, deferred), [items, deferred]);
  const bounds = useMemo(() => priceBounds(items, query.category), [items, query.category]);

  useEffect(() => {
    const search = serializeCatalogQuery(query);
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [query]);

  const update = (patch: Partial<CatalogQuery>) => {
    setQuery((q) => ({ ...q, ...patch }));
    setLimit(PAGE);
  };
  const toggle = (values: readonly string[], value: string) =>
    values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  const setFacet = (key: string, value: string) =>
    update({ facets: { ...query.facets, [key]: toggle(query.facets[key] ?? [], value) } });

  const active = activeChips(query, update);
  const filtersCount = active.length;

  const filters = (
    <div className="grid content-start gap-6">
      <FilterGroup title="Цена, ₸">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={cn(FIELD, "w-full")}
            inputMode="numeric"
            aria-label="Цена от"
            placeholder={`от ${bounds.min.toLocaleString("ru-RU")}`}
            value={query.priceMin ?? ""}
            onChange={(e) => update({ priceMin: toPrice(e.target.value) })}
          />
          <input
            className={cn(FIELD, "w-full")}
            inputMode="numeric"
            aria-label="Цена до"
            placeholder={`до ${bounds.max.toLocaleString("ru-RU")}`}
            value={query.priceMax ?? ""}
            onChange={(e) => update({ priceMax: toPrice(e.target.value) })}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Наличие">
        <select className={cn(FIELD, "w-full cursor-pointer")} value={query.city} onChange={(e) => update({ city: e.target.value as City | "all" })} aria-label="Город">
          <option value="all">Весь Казахстан</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {CITY_LABELS[city]}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="size-4 accent-accent" checked={query.inStockOnly} onChange={(e) => update({ inStockOnly: e.target.checked })} />
          Только в наличии
        </label>
      </FilterGroup>

      {facets.map(({ facet, options }) =>
        options.length > 1 || (query.facets[facet.key]?.length ?? 0) > 0 ? (
          <FilterGroup key={facet.key} title={facet.label}>
            <div className="flex flex-wrap gap-1.5">
              {options.map((o) => (
                <Chip key={o.value} pressed={query.facets[facet.key]?.includes(o.value) ?? false} onClick={() => setFacet(facet.key, o.value)}>
                  {o.value} <span className="text-muted">{o.count}</span>
                </Chip>
              ))}
            </div>
          </FilterGroup>
        ) : null,
      )}

      <FilterGroup title="Бренд">
        <div className="grid max-h-64 gap-1.5 overflow-y-auto pr-1" data-lenis-prevent="">
          {brands.map((b) => (
            <label key={b.value} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-accent"
                checked={query.brands.includes(b.value)}
                onChange={() => update({ brands: toggle(query.brands, b.value) })}
              />
              <span className="flex-1">{b.value}</span>
              <span className="text-xs text-muted">{b.count}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-6">
      <div ref={tabs} className="relative flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Категории">
        {(["all", ...COMPONENT_CATEGORIES] as const).map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={query.category === category}
            onClick={() => update({ category, facets: {} })}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
              query.category === category ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {category === "all" ? "Все" : CATEGORY_LABELS[category]}
            <span className="text-xs opacity-60">{counts[category] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filters}</div>
        </aside>

        <div className="grid content-start gap-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="search"
              className={cn(FIELD, "min-w-0 flex-1 basis-60")}
              placeholder="Поиск: 4070, DDR5, Noctua…"
              aria-label="Поиск по каталогу"
              value={query.search}
              onChange={(e) => update({ search: e.target.value.slice(0, 100) })}
            />
            <select
              className={cn(FIELD, "cursor-pointer")}
              aria-label="Сортировка"
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value as CatalogSort })}
            >
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="stock">Больше в наличии</option>
              <option value="name">По названию</option>
            </select>
          </div>

          <details className="group rounded-card border border-line bg-surface/60 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
              Фильтры{filtersCount ? ` · ${filtersCount}` : ""}
              <span className="text-muted transition-transform group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="border-t border-line p-4">{filters}</div>
          </details>

          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-sm text-muted" aria-live="polite">
              Найдено: {results.length}
            </p>
            {active.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-[13px] transition-colors hover:text-danger"
              >
                {chip.label} <span aria-hidden>✕</span>
              </button>
            ))}
            {filtersCount > 0 && (
              <button type="button" onClick={() => update({ ...EMPTY_QUERY, category: query.category })} className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
                Сбросить всё
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="grid justify-items-start gap-3 rounded-panel border border-dashed border-line-strong p-8">
              <p className="text-muted">Ничего не нашлось. Попробуйте убрать часть фильтров.</p>
              <button type="button" onClick={() => update({ ...EMPTY_QUERY })} className="text-sm text-accent hover:underline">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, limit).map((item) => (
                <li key={item.id}>
                  <ProductCard item={item} city={query.city} showCategory={query.category === "all"} />
                </li>
              ))}
            </ul>
          )}

          {results.length > limit && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className="justify-self-center rounded-full border border-line-strong px-6 py-2.5 text-sm transition-colors hover:border-accent"
            >
              Показать ещё {Math.min(PAGE, results.length - limit)} из {results.length - limit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ item, city, showCategory }: { item: PcComponent; city: City | "all"; showCategory: boolean }) {
  const stock = stockIn(item, city);
  const selection = { [item.category]: item } as BuildSelection;
  const href = `/catalog/${item.id}`;
  const openOrder = useOrderModal();
  return (
    <article className="group/card relative flex h-full flex-col gap-3 rounded-card border border-line bg-surface/70 p-3 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong">
      <ProductPhoto item={item} className="aspect-[4/3]" />
      <div className="grid gap-0.5 px-1">
        {showCategory && <p className="text-[11px] uppercase tracking-[0.06em] text-muted">{CATEGORY_LABELS[item.category]}</p>}
        <h3 className="text-[15px] font-medium leading-snug">
          <Link href={href} className="text-ink no-underline after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-accent">
            <span className="font-normal text-muted">{item.brand}</span> {item.name}
          </Link>
        </h3>
      </div>
      <dl className="grid gap-1 px-1 text-[13px]">
        {Object.entries(item.specs)
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3">
              <dt className="text-muted">{key}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
      </dl>
      <div className="mt-auto grid gap-3 border-t border-line px-1 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[17px]">{formatPrice(item.price)}</span>
          <span
            className={cn("text-xs", item.outOfStock ? "text-danger" : stock > 0 ? "text-success" : "text-muted")}
            title={item.outOfStock ? undefined : CITIES.map((c) => `${CITY_LABELS[c]}: ${item.stock[c] ?? 0}`).join(", ")}
          >
            {item.outOfStock ? "нет в наличии" : stock > 0 ? `в наличии ${stock} шт.` : "под заказ 3–7 дней"}
          </span>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-2">
          {item.outOfStock ? (
            <span className="inline-flex h-9 items-center justify-center rounded-full border border-dashed border-line text-[13px] text-muted">Нет в наличии</span>
          ) : (
            <button
              type="button"
              onClick={() => openOrder({ selection, title: `${item.brand} ${item.name}`, part: true })}
              className="inline-flex h-9 items-center justify-center rounded-full bg-accent text-[13px] font-medium text-on-accent transition-[filter] hover:brightness-110"
            >
              Купить
            </button>
          )}
          <Link
            href={builderHref({ selection, focus: item.category })}
            className="inline-flex h-9 items-center justify-center rounded-full border border-line-strong text-[13px] no-underline transition-colors hover:border-accent"
          >
            В сборку
          </Link>
        </div>
      </div>
    </article>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-2.5">
      <legend className="mb-2.5 text-[12px] uppercase tracking-[0.06em] text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="rounded-full border border-line px-3 py-1 text-[13px] transition-colors hover:border-line-strong aria-pressed:border-accent aria-pressed:bg-accent/10"
    >
      {children}
    </button>
  );
}

const toPrice = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  return digits ? Number(digits) : null;
};

function activeChips(q: CatalogQuery, update: (patch: Partial<CatalogQuery>) => void) {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (q.search) chips.push({ key: "q", label: `«${q.search}»`, clear: () => update({ search: "" }) });
  if (q.priceMin !== null) chips.push({ key: "min", label: `от ${formatPrice(q.priceMin)}`, clear: () => update({ priceMin: null }) });
  if (q.priceMax !== null) chips.push({ key: "max", label: `до ${formatPrice(q.priceMax)}`, clear: () => update({ priceMax: null }) });
  if (q.city !== "all") chips.push({ key: "city", label: CITY_LABELS[q.city], clear: () => update({ city: "all" }) });
  if (q.inStockOnly) chips.push({ key: "stock", label: "В наличии", clear: () => update({ inStockOnly: false }) });
  for (const b of q.brands) chips.push({ key: `b-${b}`, label: b, clear: () => update({ brands: q.brands.filter((x) => x !== b) }) });
  for (const [key, values] of Object.entries(q.facets))
    for (const v of values)
      chips.push({ key: `f-${key}-${v}`, label: v, clear: () => update({ facets: { ...q.facets, [key]: values.filter((x) => x !== v) } }) });
  return chips;
}
