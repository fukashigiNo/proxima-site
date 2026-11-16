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
