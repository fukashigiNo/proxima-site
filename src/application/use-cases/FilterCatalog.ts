import { stockIn, type City, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";

export type CatalogSort = "price-asc" | "price-desc" | "name" | "stock";

export interface CatalogQuery {
  readonly category: ComponentCategory | "all";
  readonly search: string;
  readonly brands: readonly string[];
  readonly priceMin: number | null;
  readonly priceMax: number | null;
  readonly city: City | "all";
  readonly inStockOnly: boolean;
  readonly sort: CatalogSort;
  readonly facets: Readonly<Record<string, readonly string[]>>;
}

export const EMPTY_QUERY: CatalogQuery = {
  category: "all",
  search: "",
  brands: [],
  priceMin: null,
  priceMax: null,
  city: "all",
  inStockOnly: false,
  sort: "price-asc",
  facets: {},
};

export interface Facet {
  readonly key: string;
  readonly label: string;
  readonly values: (component: PcComponent) => string[];
  readonly order?: (a: string, b: string) => number;
}

const sizeOrder = (a: string, b: string) => parseSize(a) - parseSize(b);
const parseSize = (value: string) => {
  const n = parseFloat(value.replace(",", "."));
  return /ТБ/.test(value) ? n * 1024 : n;
};
const numeric = (a: string, b: string) => parseFloat(a) - parseFloat(b);
const capacity = (name: string) => name.match(/(\d+(?:[.,]\d+)?)\s*(ГБ|ТБ)/)?.[0].replace(/\s+/, " ");

export const CATEGORY_FACETS: Record<ComponentCategory, readonly Facet[]> = {
  cpu: [{ key: "socket", label: "Сокет", values: (c) => (c.category === "cpu" ? [c.socket] : []) }],
  motherboard: [
    { key: "socket", label: "Сокет", values: (c) => (c.category === "motherboard" ? [c.socket] : []) },
    { key: "memory", label: "Память", values: (c) => (c.category === "motherboard" ? [c.memoryType] : []) },
    { key: "form", label: "Форм-фактор", values: (c) => (c.category === "motherboard" ? [c.formFactor] : []) },
    { key: "gen5", label: "M.2 PCIe 5.0", values: (c) => (c.category === "motherboard" ? [c.pcieGen5M2 ? "Есть" : "Нет"] : []) },
  ],
  gpu: [
    { key: "vram", label: "Видеопамять", values: (c) => (c.category === "gpu" ? [capacity(c.name) ?? "—"] : []), order: sizeOrder },
    { key: "connector", label: "Питание", values: (c) => (c.category === "gpu" ? [c.powerConnector] : []) },
    { key: "fans", label: "Вентиляторы", values: (c) => (c.category === "gpu" ? [`${c.fans}`] : []), order: numeric },
  ],
  ram: [
    { key: "memory", label: "Тип", values: (c) => (c.category === "ram" ? [c.memoryType] : []) },
    { key: "size", label: "Объём", values: (c) => (c.category === "ram" ? [capacity(c.name) ?? "—"] : []), order: sizeOrder },
    { key: "sticks", label: "Модулей", values: (c) => (c.category === "ram" ? [`${c.sticks}`] : []), order: numeric },
  ],
  storage: [
    { key: "size", label: "Объём", values: (c) => (c.category === "storage" ? [capacity(c.name) ?? "—"] : []), order: sizeOrder },
    { key: "pcie", label: "Интерфейс", values: (c) => (c.category === "storage" ? [`PCIe ${c.pcieGen}.0`] : []) },
  ],
  cooling: [
    { key: "kind", label: "Тип", values: (c) => (c.category === "cooling" ? [c.kind === "air" ? "Воздушное" : "СЖО"] : []) },
    {
      key: "size",
      label: "Размер",
      values: (c) => (c.category !== "cooling" ? [] : c.kind === "aio" ? [`${c.radiatorMm} мм радиатор`] : [c.heightMm <= 155 ? "до 155 мм" : "выше 155 мм"]),
    },
  ],
  psu: [
    { key: "watt", label: "Мощность", values: (c) => (c.category === "psu" ? [`${c.wattage} Вт`] : []), order: numeric },
    { key: "native", label: "Разъём 12V-2x6", values: (c) => (c.category === "psu" ? [c.native12V2x6 ? "Есть" : "Нет"] : []) },
  ],
  case: [
    { key: "form", label: "Плата", values: (c) => (c.category === "case" ? [...c.formFactors] : []) },
    { key: "color", label: "Цвет", values: (c) => (c.category === "case" ? [c.color === "white" ? "Белый" : "Чёрный"] : []) },
  ],
};

export const facetsFor = (category: CatalogQuery["category"]): readonly Facet[] => (category === "all" ? [] : CATEGORY_FACETS[category]);

const haystack = (c: PcComponent) => `${c.brand} ${c.name} ${Object.values(c.specs).join(" ")}`.toLowerCase();

function matches(c: PcComponent, q: CatalogQuery, skip?: string): boolean {
  if (q.category !== "all" && c.category !== q.category) return false;
  if (q.search) {
    const text = haystack(c);
    if (!q.search.toLowerCase().split(/\s+/).filter(Boolean).every((word) => text.includes(word))) return false;
  }
  if (skip !== "brand" && q.brands.length && !q.brands.includes(c.brand)) return false;
  if (q.priceMin !== null && c.price < q.priceMin) return false;
  if (q.priceMax !== null && c.price > q.priceMax) return false;
  if (q.inStockOnly && stockIn(c, q.city) === 0) return false;
  for (const facet of facetsFor(q.category)) {
    if (facet.key === skip) continue;
    const selected = q.facets[facet.key];
    if (selected?.length && !facet.values(c).some((v) => selected.includes(v))) return false;
  }
  return true;
}

const SORTERS: Record<CatalogSort, (q: CatalogQuery) => (a: PcComponent, b: PcComponent) => number> = {
  "price-asc": () => (a, b) => a.price - b.price,
  "price-desc": () => (a, b) => b.price - a.price,
  name: () => (a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "ru"),
  stock: (q) => (a, b) => stockIn(b, q.city) - stockIn(a, q.city) || a.price - b.price,
};

export const filterCatalog = (items: readonly PcComponent[], q: CatalogQuery): PcComponent[] =>
  items.filter((c) => matches(c, q)).sort(SORTERS[q.sort](q));

export interface FacetOption {
  readonly value: string;
  readonly count: number;
}

const countOptions = (items: PcComponent[], values: (c: PcComponent) => string[], order?: (a: string, b: string) => number) => {
  const counts = new Map<string, number>();
  for (const c of items) for (const v of values(c)) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => (order ? order(a.value, b.value) : a.value.localeCompare(b.value, "ru")));
};

export function catalogFacets(items: readonly PcComponent[], q: CatalogQuery) {
  const brandPool = items.filter((c) => matches(c, q, "brand"));
  return {
    brands: countOptions(brandPool, (c) => [c.brand]),
    facets: facetsFor(q.category).map((facet) => ({
      facet,
      options: countOptions(items.filter((c) => matches(c, q, facet.key)), facet.values, facet.order),
    })),
  };
}

export const categoryCounts = (items: readonly PcComponent[], q: CatalogQuery) => {
  const base = { ...q, category: "all" as const, brands: [], facets: {} };
  const pool = items.filter((c) => matches(c, base));
  const counts: Partial<Record<ComponentCategory, number>> = {};
  for (const c of pool) counts[c.category] = (counts[c.category] ?? 0) + 1;
  return { all: pool.length, ...counts };
};

export const priceBounds = (items: readonly PcComponent[], category: CatalogQuery["category"]) => {
  const pool = category === "all" ? items : items.filter((c) => c.category === category);
  if (!pool.length) return { min: 0, max: 0 };
  return { min: Math.min(...pool.map((c) => c.price)), max: Math.max(...pool.map((c) => c.price)) };
};
