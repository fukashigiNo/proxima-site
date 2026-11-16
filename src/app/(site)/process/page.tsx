import type { Metadata } from "next";
import { Reveal } from "@/presentation/components/motion/Reveal";
import { OrderButton } from "@/presentation/components/order/OrderButton";
import { ProcessSteps } from "@/presentation/components/sections/Process";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, PageIntro, Section } from "@/presentation/components/ui/Layout";
import { BUSINESS, daysWord, yearsWord } from "@/presentation/content/business";
import { SERVICE_FACTS } from "@/presentation/content/facts";

export const metadata: Metadata = {
  alternates: { canonical: "/process" },
  title: "Как мы работаем — Proxima Computers",
  description: `Как проходит сборка ПК: подбор, сборка руками, тест под нагрузкой ${BUSINESS.testHours} часа, гарантия ${BUSINESS.warrantyYears} ${yearsWord(BUSINESS.warrantyYears)}.`,
};

const INCLUDED = [
  "проверяем совместимость и запас блока питания",
  "укладываем и стягиваем кабели, настраиваем продув",
  "обновляем BIOS, включаем XMP или EXPO, настраиваем вентиляторы",
  "по желанию ставим Windows и все драйверы",
  `гоняем процессор, видеокарту и память ${BUSINESS.testHours} часа и даём отчёт`,
  `доставляем ${BUSINESS.delivery}`,
];

const paymentText = BUSINESS.payment.length > 1 ? `${BUSINESS.payment.slice(0, -1).join(", ")} или ${BUSINESS.payment.at(-1)}` : BUSINESS.payment[0];

const FAQ = [
  {
    q: "Можно принести свои комплектующие?",
    a: "Можно. Посмотрим, всё ли совместимо и живо, соберём и протестируем. На нашу работу гарантия та же, на сами детали действует гарантия магазина, где вы их брали.",
  },
  {
    q: "А если нужной детали нет в наличии?",
    a: "Предложим равноценную замену из того, что есть. Если хотите именно ту, закажем у поставщика, обычно это занимает от двух до пяти дней.",
  },
  {
    q: "Как работает гарантия?",
    a: `На сборку и настройку даём ${BUSINESS.warrantyYears} ${yearsWord(BUSINESS.warrantyYears)}. Если проблема в нашей работе, исправим бесплатно. С гарантией производителя на детали тоже поможем: сами отвезём и разберёмся.`,
  },
  {
    q: "Как платить?",
    a: `Когда список деталей согласован, вносите предоплату за комплектующие, остальное при получении. Принимаем ${paymentText}.`,
  },
  {
    q: "Сколько ждать?",
    a: `Если всё в наличии, обычно ${BUSINESS.buildDays} ${daysWord(BUSINESS.buildDays)} вместе с тестом. Если что-то едет от поставщика, скажем срок заранее.`,
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageIntro
        eyebrow="Как мы работаем"
        title="Как проходит сборка"
        description="Без сюрпризов: что будет после вашего первого сообщения и до того, как компьютер окажется у вас на столе."
      />
      <Container className="pb-16">
        <ProcessSteps />
      </Container>

      <Section surface>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <h2 className="mb-6 text-[clamp(24px,2.6vw,32px)] font-semibold tracking-[-0.03em]">Что входит в цену сборки</h2>
            <ul className="grid gap-3 text-[17px] leading-relaxed">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-accent" aria-hidden>
                    —
                  </span>
                  <span className="first-letter:uppercase">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid content-start gap-6">
            {SERVICE_FACTS.map((fact) => (
              <div key={fact.label} className="flex items-baseline gap-4 border-b border-line pb-5">
                <dt className="min-w-[110px] text-[32px] font-semibold tracking-[-0.03em]">{fact.value}</dt>
                <dd className="text-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <h2 className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.05] tracking-[-0.035em]">Что обычно спрашивают</h2>
          <div className="grid border-t border-line">
            {FAQ.map((item) => (
              <Reveal key={item.q}>
                <details className="group border-b border-line py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="shrink-0 text-2xl font-light text-muted transition-transform duration-300 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="max-w-[640px] pt-3 leading-relaxed text-muted">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Container className="pb-24">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-10">
          <p className="max-w-[520px] text-[clamp(22px,2.4vw,30px)] font-semibold leading-tight tracking-[-0.02em]">
            Остались вопросы? Спросите, мы не кусаемся.
          </p>
          <div className="flex flex-wrap gap-2">
            <OrderButton selection={{}}>Написать нам</OrderButton>
            <LinkButton href="/builder" variant="ghost">
              Собрать в конструкторе
            </LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
