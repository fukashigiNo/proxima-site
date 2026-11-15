export const PROCESS_STEPS = [
  { title: "Консультация", text: "Обсуждаем задачи, бюджет и пожелания по внешнему виду и шуму." },
  { title: "Подбор", text: "Составляем спецификацию с проверкой совместимости и запасом на апгрейд." },
  { title: "Сборка", text: "Собираем вручную, укладываем кабели, настраиваем BIOS и кривые вентиляторов." },
  { title: "Тестирование", text: "72 часа стресс-тестов CPU, GPU и памяти. Передаём ПК с отчётом." },
];

/** Четыре шага работы — горизонтальная лента с номерами. */
export function ProcessSteps() {
  return (
    <ol className="grid grid-cols-1 gap-y-10 border-t border-ink sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
      {PROCESS_STEPS.map((step, i) => (
        <li
          key={step.title}
          className="grid content-start gap-3 pt-7 sm:pr-7 sm:even:border-l sm:even:border-line sm:even:pl-7 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-line lg:[&:not(:first-child)]:pl-7"
        >
          <span className="font-mono text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="text-[22px] font-medium tracking-[-0.02em]">{step.title}</h3>
          <p className="leading-normal text-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
