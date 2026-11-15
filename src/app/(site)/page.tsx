import Link from "next/link";
import { container } from "@/infrastructure/container";
import { Hero } from "@/presentation/components/sections/Hero";
import { Container, Section } from "@/presentation/components/ui/Layout";
import { formatPrice } from "@/presentation/lib/format";
import { BuildProvider } from "@/presentation/state/BuildContext";

const SHOWCASE_PRESET = "orbit";

export default async function HomePage() {
  const presets = await container.getPresetBuilds.execute();
  const showcase = presets.find((p) => p.id === SHOWCASE_PRESET) ?? presets[0];
  const minPrice = presets.length ? Math.min(...presets.map((p) => p.summary.total)) : null;

  const sections = [
    {
      href: "/builds",
      title: "Готовые сборки",
      text: `${presets.length} проверенные конфигурации — заказать как есть или донастроить.`,
      meta: minPrice ? `от ${formatPrice(minPrice)}` : null,
    },
    {
      href: "/builder",
      title: "Конструктор",
      text: "Комплектующие в наличии в Алматы, Астане и Шымкенте с проверкой совместимости и 3D.",
      meta: "8 категорий",
    },
    {
      href: "/process",
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
      <Section className="sm:py-24">
        <Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group grid content-between gap-10 rounded-panel border border-line p-8 text-ink no-underline transition-colors hover:border-ink"
            >
              <div className="grid gap-3">
                <h2 className="text-[26px] font-medium tracking-[-0.03em]">{s.title}</h2>
                <p className="leading-normal text-muted">{s.text}</p>
              </div>
              <div className="flex items-center justify-between font-mono text-[13px] text-muted">
                <span>{s.meta}</span>
                <span className="text-lg text-ink transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </Container>
      </Section>
    </>
  );
}
