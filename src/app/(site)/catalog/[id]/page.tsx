import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BuildSelection } from "@/domain/entities/Build";
import { CATEGORY_LABELS, CITIES, CITY_LABELS, stockIn, type PcComponent } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { ProductCard } from "@/presentation/components/catalog/CatalogView";
import { ProductPhoto } from "@/presentation/components/catalog/ProductPhoto";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container } from "@/presentation/components/ui/Layout";
import { CONTACTS, botLink } from "@/presentation/content/contacts";
import { technicalDetails } from "@/presentation/lib/componentDetails";
import { formatPrice } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";

interface Props {
  params: Promise<{ id: string }>;
}

const load = async (id: string) => (id.length <= 80 ? container.getCatalog.findById(decodeURIComponent(id)) : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await load((await params).id);
  if (!item) return { title: "Не найдено — Proxima Computers" };
  return {
    title: `${item.brand} ${item.name} — ${formatPrice(item.price)} | Proxima Computers`,
    description: `${CATEGORY_LABELS[item.category]} ${item.brand} ${item.name}: характеристики, цена в тенге и наличие в Алматы, Астане и Шымкенте.`,
    alternates: { canonical: `/catalog/${item.id}` },
    openGraph: item.image?.startsWith("https://") ? { images: [item.image] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const item = await load((await params).id);
  if (!item) notFound();

  const catalog = await container.getCatalog.execute();
  const similar = (catalog[item.category] as PcComponent[])
    .filter((c) => c.id !== item.id)
    .sort((a, b) => Math.abs(a.price - item.price) - Math.abs(b.price - item.price))
    .slice(0, 3);
  const selection = { [item.category]: item } as BuildSelection;
  const total = stockIn(item, "all");
  const details = technicalDetails(item);

  return (
    <>
      <section className="pb-10 pt-10 sm:pt-16">
        <Container>
          <nav aria-label="Навигационная цепочка" className="mb-6 animate-rise text-[14px] text-muted">
            <Link href="/" className="text-muted no-underline hover:text-ink">
              Главная
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <Link href="/catalog" className="text-muted no-underline hover:text-ink">
              Каталог
            </Link>
            <span className="mx-2 opacity-50">/</span>
            <Link href={`/catalog?cat=${item.category}`} className="text-muted no-underline hover:text-ink">
              {CATEGORY_LABELS[item.category]}
            </Link>
          </nav>

          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
            <figure className="grid animate-rise gap-2">
              <ProductPhoto item={item} priority credit="none" className="aspect-square border border-line" />
              {item.imageCredit && <figcaption className="text-[12px] text-muted">{item.imageCredit}</figcaption>}
            </figure>

            <div className="grid animate-rise content-start gap-6 [animation-delay:80ms]">
              <div className="grid gap-2">
                <p className="text-[13px] uppercase tracking-[0.08em] text-muted">{CATEGORY_LABELS[item.category]}</p>
                <h1 className="text-[clamp(28px,3.6vw,46px)] font-semibold leading-[1.05] tracking-[-0.035em]">
                  <span className="font-normal text-muted">{item.brand}</span> {item.name}
                </h1>
              </div>

              <div className="grid gap-4 rounded-panel border border-line bg-surface/70 p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-[34px] font-semibold tracking-[-0.03em]">{formatPrice(item.price)}</p>
                  <p className={total > 0 ? "text-sm text-success" : "text-sm text-muted"}>
                    {item.outOfStock ? "Нет в наличии" : total > 0 ? `В наличии ${total} шт.` : "Под заказ 3–7 дней"}
                  </p>
                </div>
                {!item.outOfStock && (
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
                    {CITIES.map((city) => (
                      <li key={city}>
                        {CITY_LABELS[city]}: <span className="text-ink">{item.stock[city] ?? 0} шт.</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.outOfStock ? (
                    <span className="inline-flex h-12 items-center rounded-full border border-dashed border-line px-6 text-muted">Нет в наличии</span>
                  ) : (
                    <OrderButton selection={selection} title={`${item.brand} ${item.name}`} part>
                      Купить
                    </OrderButton>
                  )}
                  <LinkButton href={builderHref({ selection, focus: item.category })} variant="ghost">
                    Собрать ПК с ним
                  </LinkButton>
                  {CONTACTS.bot && !item.outOfStock && (
                    <a
                      href={botLink(CONTACTS.bot, `i_${item.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center rounded-full border border-[#2aabee]/50 px-6 text-[15px] font-medium text-[#2aabee] no-underline transition-colors hover:bg-[#2aabee]/10"
                    >
                      Купить в Telegram
                    </a>
                  )}
                </div>
              </div>

              <section className="grid gap-3">
                <h2 className="text-[20px] font-medium tracking-[-0.02em]">Характеристики</h2>
                <dl className="grid divide-y divide-line rounded-panel border border-line">
                  {details.map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 px-4 py-2.5 text-[15px]">
                      <dt className="text-muted">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </Container>
      </section>

      {similar.length > 0 && (
        <Container className="pb-24">
          <h2 className="mb-4 text-[22px] font-medium tracking-[-0.02em]">Похожие по цене</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c) => (
              <li key={c.id}>
                <ProductCard item={c} city="all" showCategory={false} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </>
  );
}
