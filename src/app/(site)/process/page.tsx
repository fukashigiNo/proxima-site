import type { Metadata } from "next";
import { ProcessSteps } from "@/presentation/components/sections/Process";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, Eyebrow, PageIntro, Section } from "@/presentation/components/ui/Layout";
import { SERVICE_FACTS } from "@/presentation/content/facts";

export const metadata: Metadata = {
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
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-accent" aria-hidden>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid content-start gap-8 border-t border-line pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            {SERVICE_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[44px] font-medium tracking-[-0.04em]">{fact.value}</dt>
                <dd className="text-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-medium leading-[1.05] tracking-[-0.035em]">Частые вопросы</h2>
          <div className="grid border-t border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Container className="pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-ink px-8 py-9 text-bg">
          <p className="text-[24px] font-medium tracking-[-0.02em]">Готовы начать?</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/builder" variant="ghost" className="border-inverse-line text-bg [a&]:hover:border-bg">Собрать в конструкторе</LinkButton>
            <LinkButton href="/order" className="bg-bg text-ink [a&]:hover:bg-accent [a&]:hover:text-on-accent">Оставить заявку</LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
