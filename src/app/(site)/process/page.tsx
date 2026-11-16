import type { Metadata } from "next";
import { CountUp } from "@/presentation/components/motion/CountUp";
import { Reveal } from "@/presentation/components/motion/Reveal";
import { TextReveal } from "@/presentation/components/motion/TextReveal";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { ProcessSteps } from "@/presentation/components/sections/Process";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, Eyebrow, PageIntro, Section } from "@/presentation/components/ui/Layout";
import { SERVICE_FACTS } from "@/presentation/content/facts";

export const metadata: Metadata = {
  alternates: { canonical: "/process" },
  title: "Как мы работаем — Proxima Computers",
  description: "Консультация, подбор, ручная сборка и 72 часа стресс-тестов. Гарантия 3 года на работу.",
};

const INCLUDED = [
  "Проверка совместимости и запаса по питанию",
  "Укладка и стяжка кабелей, настройка воздушных потоков",
  "Обновление BIOS, включение XMP/EXPO, кривые вентиляторов",
  "Установка Windows и драйверов по желанию",
  "Стресс-тест CPU, GPU и памяти с отчётом температур",
  "Доставка по Алматы, Астане и Шымкенту",
];

const FAQ = [
  {
    q: "Можно ли принести свои комплектующие?",
    a: "Да. Проверим совместимость и состояние, соберём и протестируем. Гарантия на работу сохраняется, на детали — от продавца.",
  },
  {
    q: "Что если комплектующего нет в наличии?",
    a: "Предложим равноценную замену из наличия или закажем со склада поставщика — срок обычно 2–5 дней.",
  },
  {
    q: "Как работает гарантия?",
    a: "3 года на сборку: если проблема в монтаже или настройке — исправим бесплатно. На комплектующие действует гарантия производителя, обращения берём на себя.",
  },
  {
    q: "Как оплатить?",
    a: "Предоплата за комплектующие после согласования спецификации, остаток — при получении. Kaspi, карта или безналичный расчёт для юрлиц.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageIntro
        eyebrow="Как мы работаем"
        title="Четыре шага до готового ПК."
        description="От первого сообщения до компьютера на вашем столе — обычно 48 часов."
      />
      <Container className="pb-20">
        <ProcessSteps />
      </Container>

      <Section surface>
        <Container className="grid gap-12 md:grid-cols-2">
          <div className="grid content-start gap-8">
            <Eyebrow>Что входит в сборку</Eyebrow>
            <ul className="grid gap-3 text-[17px]">
              {INCLUDED.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 70} className="flex gap-3">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-accent/50 text-[11px] text-accent" aria-hidden>✓</span>
                  {item}
                </Reveal>
              ))}
            </ul>
          </div>
          <dl className="grid content-start gap-8 border-t border-line pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            {SERVICE_FACTS.map((fact, i) => (
              <Reveal key={fact.label} delay={i * 120}>
                <dt className="text-glow text-[52px] font-semibold tracking-[-0.04em] text-accent">
                  <CountUp value={fact.value} />
                </dt>
                <dd className="text-muted">{fact.label}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <TextReveal text="Частые вопросы" className="text-[clamp(30px,3.8vw,50px)] font-semibold leading-[1.02] tracking-[-0.04em]" />
          <div className="grid border-t border-line">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 80}>
              <details className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-[rotate,background-color,color] duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-bg" aria-hidden>+</span>
                </summary>
                <p className="pt-3 leading-relaxed text-muted">{item.a}</p>
              </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Container className="pb-24">
        <Reveal className="glow-border rounded-panel">
          <span className="glow-border-ring" aria-hidden />
          <span className="glow-border-halo" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-panel bg-surface/75 px-8 py-10 sm:px-12">
          <p className="text-[clamp(26px,3vw,36px)] font-semibold tracking-[-0.03em]">Готовы начать?</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/builder" variant="ghost" magnetic>Собрать в конструкторе</LinkButton>
            <OrderButton selection={{}} magnetic>
              Оставить заявку
            </OrderButton>
          </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
