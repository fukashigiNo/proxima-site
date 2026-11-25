import { EMPTY_QUERY, type CatalogQuery, type CatalogSort } from "@/application/use-cases/FilterCatalog";
import { CITIES, COMPONENT_CATEGORIES, type City, type ComponentCategory } from "@/domain/entities/PcComponent";

const SORTS: readonly CatalogSort[] = ["price-asc", "price-desc", "name", "stock"];
const list = (raw?: string | null) => (raw ? raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20) : []);
const price = (raw?: string | null) => {
  const n = Number(raw);
  return raw && Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

export type RawParams = Record<string, string | string[] | undefined>;

export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const get = (key: string) => {
    const v = params[key];
    return (Array.isArray(v) ? v[0] : v)?.slice(0, 200) ?? null;
  };
  const facets: Record<string, string[]> = {};
  for (const key of Object.keys(params)) if (key.startsWith("f.")) facets[key.slice(2)] = list(get(key));
  const category = get("cat");
  const city = get("city");
  const sort = get("sort");
  return {
    category: COMPONENT_CATEGORIES.includes(category as ComponentCategory) ? (category as ComponentCategory) : "all",
    search: get("q")?.trim() ?? "",
    brands: list(get("brand")),
    priceMin: price(get("min")),
    priceMax: price(get("max")),
    city: CITIES.includes(city as City) ? (city as City) : "all",
    inStockOnly: get("stock") === "1",
    sort: SORTS.includes(sort as CatalogSort) ? (sort as CatalogSort) : EMPTY_QUERY.sort,
    facets,
  };
}

export function serializeCatalogQuery(q: CatalogQuery): string {
  const p = new URLSearchParams();
  if (q.category !== "all") p.set("cat", q.category);
  if (q.search) p.set("q", q.search);
  if (q.brands.length) p.set("brand", q.brands.join(","));
  if (q.priceMin !== null) p.set("min", String(q.priceMin));
  if (q.priceMax !== null) p.set("max", String(q.priceMax));
  if (q.city !== "all") p.set("city", q.city);
  if (q.inStockOnly) p.set("stock", "1");
  if (q.sort !== EMPTY_QUERY.sort) p.set("sort", q.sort);
  for (const [key, values] of Object.entries(q.facets)) if (values.length) p.set(`f.${key}`, values.join(","));
  return p.toString();
}
