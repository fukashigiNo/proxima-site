import Link from "next/link";
import { CATEGORY_LABELS, CITIES, CITY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory, type PcComponent } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { OfferRow } from "@/presentation/components/admin/OfferRow";
import { cn } from "@/presentation/lib/cn";
import { PageTitle } from "../PageTitle";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const { category: raw, q = "" } = await searchParams;
  const category: ComponentCategory = COMPONENT_CATEGORIES.includes(raw as ComponentCategory) ? (raw as ComponentCategory) : "cpu";
  const catalog = await container.getCatalog.execute();
  const query = q.trim().toLowerCase();
  const items: PcComponent[] = catalog[category].filter(
    (c) => !query || `${c.brand} ${c.name} ${c.id}`.toLowerCase().includes(query),
  );

  return (
    <>
      <PageTitle
        title="Каталог"
        description="Цены в тенге и остатки по городам. Изменения сразу видны на сайте."
        actions={
          <div className="flex flex-wrap gap-2">
          <form className="flex gap-2">
            <input type="hidden" name="category" value={category} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Поиск по названию"
              className="h-10 w-56 rounded-full border border-line-strong bg-bg px-4 text-sm text-ink outline-none focus:border-ink"
            />
          </form>
          <Link
            href={`/admin/catalog/new?category=${category}`}
            className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg no-underline transition-colors hover:bg-accent"
          >
            + Добавить
          </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {COMPONENT_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/admin/catalog?category=${c}`}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] no-underline transition-colors",
              c === category ? "border-ink bg-ink text-bg" : "border-line-strong bg-bg text-ink hover:border-ink",
            )}
          >
            {CATEGORY_LABELS[c]} <span className="opacity-60">{catalog[c].length}</span>
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-panel border border-line bg-bg">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_120px_repeat(3,72px)_110px] gap-x-3 border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-muted md:grid">
          <span>Позиция</span>
          <span className="text-right">Цена, ₸</span>
          {CITIES.map((city) => (
            <span key={city} className="text-right">
              {CITY_LABELS[city].slice(0, 3)}.
            </span>
          ))}
          <span />
        </div>
        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Ничего не найдено.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} id={c.id} className="scroll-mt-6 target:bg-accent/5">
              <OfferRow component={c} />
            </div>
          ))
        )}
      </section>
    </>
  );
}
