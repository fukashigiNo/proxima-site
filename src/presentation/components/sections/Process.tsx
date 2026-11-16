import { Reveal } from "../motion/Reveal";

export const PROCESS_STEPS = [
  { title: "Консультация", text: "Обсуждаем задачи, бюджет и пожелания по внешнему виду и шуму." },
  { title: "Подбор", text: "Составляем спецификацию с проверкой совместимости и запасом на апгрейд." },
  { title: "Сборка", text: "Собираем вручную, укладываем кабели, настраиваем BIOS и кривые вентиляторов." },
  { title: "Тестирование", text: "72 часа стресс-тестов CPU, GPU и памяти. Передаём ПК с отчётом." },
];

export function ProcessSteps() {
  return (
    <Reveal className="relative">
      <div className="reveal-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent-2 to-transparent shadow-[0_0_14px_var(--glow)]" aria-hidden />
      <ol className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
        {PROCESS_STEPS.map((step, i) => (
          <Reveal
            as="li"
            key={step.title}
            delay={200 + i * 140}
            className="group grid content-start gap-3 pt-[46px] lg:pt-[46px] sm:pr-7 sm:even:border-l sm:even:border-line sm:even:pl-7 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line lg:[&:not(:first-child)]:pl-7"
          >
            <span className="-mt-[64px] mb-4 grid size-9 place-items-center rounded-full border border-accent/60 bg-bg font-mono text-[13px] text-accent transition-[background-color,color,box-shadow] duration-300 group-hover:bg-accent group-hover:text-on-accent group-hover:shadow-[0_0_24px_var(--glow)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-[24px] font-semibold tracking-[-0.025em]">{step.title}</h2>
            <p className="leading-normal text-muted">{step.text}</p>
          </Reveal>
        ))}
      </ol>
    </Reveal>
  );
}
