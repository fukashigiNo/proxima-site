import { BUSINESS } from "@/presentation/content/business";
import { Reveal } from "../motion/Reveal";

export const PROCESS_STEPS = [
  {
    title: "Пишете нам",
    text: "Достаточно пары фраз: во что играете или в чём работаете, сколько готовы потратить, есть ли пожелания по виду и шуму. Можно скинуть сборку из конструктора.",
  },
  {
    title: "Подбираем и согласуем",
    text: "Присылаем список деталей с ценами из наличия. Если что-то можно взять дешевле без потери в деле, скажем. Цену фиксируем.",
  },
  {
    title: "Собираем",
    text: "Собираем руками, прокладываем кабели, обновляем BIOS, включаем профиль памяти и настраиваем вентиляторы, чтобы не шумело зря.",
  },
  {
    title: "Тестируем и отдаём",
    text: `Компьютер ${BUSINESS.testHours} часа стоит под нагрузкой. Потом отдаём его вам вместе с отчётом о температурах, лично или с доставкой.`,
  },
];

export function ProcessSteps() {
  return (
    <ol className="grid max-w-[880px] gap-0">
      {PROCESS_STEPS.map((step, i) => (
        <Reveal
          as="li"
          key={step.title}
          delay={i * 80}
          className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-4 border-t border-line py-8 sm:grid-cols-[72px_minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-x-8"
        >
          <span className="text-[28px] font-semibold text-accent">{i + 1}</span>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em]">{step.title}</h2>
          <p className="col-start-2 mt-2 leading-relaxed text-muted sm:col-start-3 sm:mt-0">{step.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
