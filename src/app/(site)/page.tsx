import type { Metadata } from "next";
import Link from "next/link";
import { COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { Marquee } from "@/presentation/components/motion/Marquee";
import { Reveal } from "@/presentation/components/motion/Reveal";
import { TextReveal } from "@/presentation/components/motion/TextReveal";
import { Tilt } from "@/presentation/components/motion/Tilt";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { Hero } from "@/presentation/components/sections/Hero";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, Section } from "@/presentation/components/ui/Layout";
import { formatPrice } from "@/presentation/lib/format";
import { BuildProvider } from "@/presentation/state/BuildContext";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SHOWCASE_PRESET = "orbit";

export default async function HomePage() {
  const [presets, catalog] = await Promise.all([container.getPresetBuilds.execute(), container.getCatalog.execute()]);
  const showcase = presets.find((p) => p.id === SHOWCASE_PRESET) ?? presets[0];
  const minPrice = presets.length ? Math.min(...presets.map((p) => p.summary.total)) : null;
  const brands = [...new Set(COMPONENT_CATEGORIES.flatMap((c) => catalog[c].map((item) => item.brand)))].sort();
  const partsCount = COMPONENT_CATEGORIES.reduce((n, c) => n + catalog[c].length, 0);

  const sections = [
    {
      href: "/builds",
      index: "01",
      title: "Готовые сборки",
      text: `${presets.length} проверенные конфигурации — заказать как есть или донастроить.`,
      meta: minPrice ? `от ${formatPrice(minPrice)}` : null,
    },
    {
      href: "/builder",
      index: "02",
      title: "Конструктор",
      text: "Комплектующие в наличии в Алматы, Астане и Шымкенте. Проверка совместимости и 3D в реальном времени.",
      meta: `${partsCount} позиций`,
    },
    {
      href: "/process",
      index: "03",
      title: "Как мы работаем",
      text: "Консультация, подбор, ручная сборка и 72 часа стресс-тестов перед выдачей.",
      meta: "4 шага",
    },
  ];

  return (
    <>
      <BuildProvider initial={showcase?.selection ?? {}} initialTitle={showcase?.title}>
        <Hero presetId={showcase?.id} />
      </BuildProvider>

      <div className="border-y border-line bg-surface/50 py-6">
        <Marquee duration={38}>
          {brands.map((brand) => (
            <span key={brand} className="flex items-center gap-10 pr-10 font-mono text-[15px] uppercase tracking-[0.18em] text-muted">
              {brand}
              <span className="size-1.5 rotate-45 bg-accent/70" aria-hidden />
            </span>
          ))}
        </Marquee>
      </div>

      <Section>
        <Container>
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <TextReveal
              text="Всё, что нужно для сильного ПК."
              accent={["сильного"]}
              className="max-w-[720px] text-[clamp(32px,4.5vw,60px)] font-semibold leading-[1.02] tracking-[-0.04em]"
            />
            <p className="max-w-[340px] text-muted">Выберите, с чего начать — готовая конфигурация, свой конструктор или консультация.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {sections.map((s, i) => (
              <Reveal key={s.href} delay={i * 110} className="grid">
                <Tilt className="grid rounded-panel">
                  <Link
                    href={s.href}
                    className="group grid min-h-[300px] content-between gap-10 rounded-panel border border-line bg-surface/60 p-8 text-ink no-underline transition-colors duration-300 hover:border-line-strong"
                  >
                    <div className="grid gap-4">
                      <span className="font-mono text-[12px] tracking-[0.14em] text-accent-2">[ {s.index} ]</span>
                      <h3 className="text-[28px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                      <p className="leading-normal text-muted">{s.text}</p>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[13px] text-muted">
                      <span>{s.meta}</span>
                      <span
                        className="grid size-10 place-items-center rounded-full border border-line-strong text-base text-ink transition-[background-color,color,border-color,translate,box-shadow] duration-300 group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent group-hover:shadow-[0_0_24px_var(--glow)]"
                        aria-hidden
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Container className="pb-28">
        <Reveal className="glow-border rounded-panel">
          <span className="glow-border-ring" aria-hidden />
          <span className="glow-border-halo" aria-hidden />
          <div className="grid gap-8 overflow-hidden rounded-panel bg-surface/75 px-8 py-14 sm:px-14 md:grid-cols-[1fr_auto] md:items-center">
            <div className="grid gap-4">
              <TextReveal
                text="Соберём ПК мечты за 48 часов."
                accent={["мечты"]}
                className="text-[clamp(30px,4vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]"
              />
              <p className="max-w-[520px] text-muted">Оставьте заявку — ответим в течение часа, подберём конфигурацию и зафиксируем цену.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <OrderButton selection={{}} magnetic>
                Оставить заявку
              </OrderButton>
              <LinkButton href="/builder" variant="ghost" magnetic>
                Конструктор
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
