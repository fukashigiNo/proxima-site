import type { Metadata } from "next";
import Link from "next/link";
import { COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { Reveal } from "@/presentation/components/motion/Reveal";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { Hero } from "@/presentation/components/sections/Hero";
import { ReviewsSection, ShowcaseSection } from "@/presentation/components/sections/Social";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, Section } from "@/presentation/components/ui/Layout";
import { Note } from "@/presentation/components/ui/Note";
import { BUSINESS } from "@/presentation/content/business";
import { formatPrice } from "@/presentation/lib/format";
import { BuildProvider } from "@/presentation/state/BuildContext";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SHOWCASE_PRESET = "orbit";

export default async function HomePage() {
  const [presets, catalog] = await Promise.all([container.getPresetBuilds.execute(), container.getCatalog.execute()]);
  const showcase = presets.find((p) => p.id === SHOWCASE_PRESET) ?? presets[0];
  const minPrice = presets.length ? Math.min(...presets.map((p) => p.summary.total)) : null;
  const inStock = COMPONENT_CATEGORIES.reduce((n, c) => n + catalog[c].filter((item) => Object.values(item.stock).some((q) => q > 0)).length, 0);

  const paths = [
    {
      href: "/builds",
      title: "Взять готовую сборку",
      text: "Если не хочется разбираться. Несколько проверенных вариантов под игры, учёбу и работу, любую можно поменять под себя.",
      meta: minPrice ? `от ${formatPrice(minPrice)}` : null,
    },
    {
      href: "/builder",
      title: "Собрать самому",
      text: "Выбираете детали из того, что есть в наличии, а конструктор сразу подсказывает, если что-то не подходит друг к другу.",
      meta: `${inStock} позиций в наличии`,
    },
    {
      href: "/process",
      title: "Сначала узнать, как всё устроено",
      text: "Сроки, гарантия, оплата и ответы на вопросы, которые нам задают чаще всего.",
      meta: null,
    },
  ];

  const experience = [
    BUSINESS.since && `Собираем с ${BUSINESS.since} года`,
    BUSINESS.buildsDone && `${BUSINESS.buildsDone}+ компьютеров уже у владельцев`,
  ].filter(Boolean);

  return (
    <>
      <BuildProvider initial={showcase?.selection ?? {}} initialTitle={showcase?.title}>
        <Hero presetId={showcase?.id} />
      </BuildProvider>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <h2 className="text-[clamp(28px,3.4vw,46px)] font-semibold leading-[1.08] tracking-[-0.035em]">
            Как это выглядит с&nbsp;вашей стороны
          </h2>
          <Reveal className="grid max-w-[640px] gap-5 text-[17px] leading-relaxed text-muted">
            <p>
              Вы рассказываете, для чего нужен компьютер и сколько готовы потратить. Мы подбираем железо, проверяем, что всё
              друг с другом дружит, и присылаем список с ценами. Если согласны, собираем.
            </p>
            <p>
              Дальше аккуратно укладываем кабели, обновляем BIOS, ставим систему и драйверы и оставляем компьютер на стенде под
              нагрузкой. Если на тесте что-то греется или сбоит, вы об этом не узнаете: деталь поменяем до выдачи.
            </p>
            {experience.length > 0 && <p className="text-ink">{experience.join(". ")}.</p>}
          </Reveal>
        </Container>
      </Section>

      <Section className="pt-0 sm:pt-0">
        <Container>
          <h2 className="mb-6 text-[clamp(24px,2.6vw,32px)] font-semibold tracking-[-0.03em]">С чего начать</h2>
          <ul className="border-t border-line">
            {paths.map((p) => (
              <li key={p.href} className="border-b border-line">
                <Link
                  href={p.href}
                  className="group grid gap-2 py-7 text-ink no-underline sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-baseline sm:gap-10"
                >
                  <span className="text-[22px] font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">{p.title}</span>
                  <span className="text-muted">{p.text}</span>
                  <span className="flex items-center gap-3 whitespace-nowrap text-[14px] text-muted">
                    {p.meta}
                    <span className="text-ink transition-transform group-hover:translate-x-1" aria-hidden>
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <ShowcaseSection />
      <ReviewsSection />

      <Section>
        <Container className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid max-w-[620px] gap-4">
            <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.08] tracking-[-0.035em]">
              Не знаете, что выбрать? Просто напишите
            </h2>
            <p className="text-[17px] leading-relaxed text-muted">
              Опишите своими словами, во что играете или в чём работаете. Ответим {BUSINESS.replyTime} и предложим пару
              вариантов под ваш бюджет.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <OrderButton selection={{}}>Написать нам</OrderButton>
            <LinkButton href="/builder" variant="ghost">
              Открыть конструктор
            </LinkButton>
            <span className="absolute -top-12 right-0 max-md:hidden">
              <Note arrow="down-left" rotate={4}>
                отвечаем живые люди
              </Note>
            </span>
          </div>
        </Container>
      </Section>
    </>
  );
}
