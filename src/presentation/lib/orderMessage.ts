import { evaluateBuild } from "@/application/use-cases/EvaluateBuild";
import { selectedComponents, type BuildSelection } from "@/domain/entities/Build";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";

export const toMessengerText = (text: string) =>
  text
    .replace(/[    ]/g, " ")
    .replace(/[‒-―−]/g, "-")
    .replace(/[×]/g, "x")
    .replace(/[«»“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, "...")
    .replace(/₸/g, "тг");

const money = (value: number) => `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} тг`;

const configLink = (origin: string, selection: BuildSelection) => {
  const ids = selectedComponents(selection).map((c) => c.id);
  return ids.length ? `${origin}/builder?parts=${ids.join(",")}` : `${origin}/builder`;
};

export function buildPartMessage(selection: BuildSelection, origin: string, reference?: string) {
  const parts = selectedComponents(selection);
  const total = parts.reduce((sum, p) => sum + p.price, 0);
  const text = [
    "Здравствуйте! Хочу купить в Proxima Computers:",
    "",
    ...parts.map((p) => `- ${CATEGORY_LABELS[p.category]}: ${p.brand} ${p.name} - ${money(p.price)}`),
    "",
    `Итого: ${money(total)}`,
    "",
    ...(reference ? [`Код заявки: ${reference}`] : []),
    ...parts.map((p) => `Ссылка: ${origin}/catalog/${p.id}`),
  ];
  return toMessengerText(text.join("\n"));
}

export function buildOrderMessage(selection: BuildSelection, title: string | null, origin: string, reference?: string) {
  const summary = evaluateBuild(selection);
  const lines = COMPONENT_CATEGORIES.flatMap((category) => {
    const part = selection[category];
    return part ? [`- ${CATEGORY_LABELS[category]}: ${part.brand} ${part.name} - ${money(part.price)}`] : [];
  });
  const code = reference ? [`Код заявки: ${reference}`] : [];

  const text =
    lines.length === 0
      ? ["Здравствуйте! Хочу заказать сборку ПК в Proxima Computers. Подскажите, пожалуйста, по конфигурации.", ...(code.length ? ["", ...code] : [])]
      : [
          `Здравствуйте! Хочу заказать сборку${title ? ` "${title}"` : ""} в Proxima Computers.`,
          "",
          ...lines,
          "",
          `Сборка и тест: ${money(summary.assemblyFee)}`,
          `Итого: ${money(summary.total)}`,
          "",
          ...code,
          `Конфигурация: ${configLink(origin, selection)}`,
        ];

  return toMessengerText(text.join("\n"));
}

export function buildFormRequestMessage(
  request: { id: string; name: string; contact: string; budget?: number; comment?: string },
  selection: BuildSelection,
  title: string | null,
  origin: string,
) {
  const lines = COMPONENT_CATEGORIES.flatMap((category) => {
    const part = selection[category];
    return part ? [`- ${CATEGORY_LABELS[category]}: ${part.brand} ${part.name} - ${money(part.price)}`] : [];
  });
  const summary = evaluateBuild(selection);
  const text = [
    `Здравствуйте! Я оставил(а) заявку ${request.id} на сайте Proxima Computers.`,
    "",
    `Имя: ${request.name}`,
    `Контакт: ${request.contact}`,
    ...(request.budget ? [`Бюджет: ${money(request.budget)}`] : []),
    ...(request.comment ? [`Задача: ${request.comment}`] : []),
    ...(lines.length
      ? ["", `Сборка${title ? ` "${title}"` : ""}:`, ...lines, `Итого: ${money(summary.total)}`, `Конфигурация: ${configLink(origin, selection)}`]
      : []),
  ];
  return toMessengerText(text.join("\n"));
}
