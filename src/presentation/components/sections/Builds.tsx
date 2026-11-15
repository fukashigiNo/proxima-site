import Link from "next/link";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { builderHref, orderHref } from "@/presentation/lib/routes";
import { LinkButton } from "../ui/Button";

/** Карточки готовых сборок. compact — короткий список ключевых деталей (для главной). */
export function PresetGrid({ presets, compact = false }: { presets: PresetBuildView[]; compact?: boolean }) {
  const featuredIndex = presets.length >= 3 ? 1 : -1;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {presets.map((preset, i) => {
        const featured = i === featuredIndex;
        const categories = compact ? (["cpu", "gpu", "ram", "storage"] as const) : COMPONENT_CATEGORIES;
        return (
          <article
            key={preset.id}
            className={cn(
              "flex flex-col gap-4 rounded-panel border p-8 transition-[border-color,transform] duration-300 hover:-translate-y-0.5",
              featured ? "border-ink bg-ink text-bg" : "border-line bg-bg hover:border-line-strong",
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn("font-mono text-xs uppercase tracking-[0.08em]", featured ? "text-inverse-muted" : "text-muted")}>
                {preset.tagline}
              </p>
              {featured && <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-on-accent">Популярное</span>}
            </div>
            <h3 className="text-[30px] font-medium tracking-[-0.03em]">{preset.title}</h3>
            <p className={cn("leading-normal", featured ? "text-inverse-muted" : "text-muted")}>{preset.purpose}</p>
            <dl className={cn("mt-2 grid gap-2.5 border-y py-5 text-[15px]", featured ? "border-inverse-line" : "border-line")}>
              {categories.map((category) => {
                const part = preset.selection[category];
                if (!part) return null;
                return (
                  <div key={category} className="grid gap-0.5">
                    {!compact && (
                      <dt className={cn("font-mono text-[11px] uppercase tracking-[0.06em]", featured ? "text-inverse-muted" : "text-muted")}>
                        {CATEGORY_LABELS[category]}
                      </dt>
                    )}
                    <dd>
                      <span className={featured ? "text-inverse-muted" : "text-muted"}>{part.brand}</span> {part.name}
                    </dd>
                  </div>
                );
              })}
            </dl>
            {!compact && (
              <p className={cn("text-[13px]", featured ? "text-inverse-muted" : "text-muted")}>
                Потребление ≈ {formatWatts(preset.summary.powerDraw)} · сборка и тест включены
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-[22px] font-medium tracking-[-0.02em]">{formatPrice(preset.summary.total)}</p>
              <div className="flex gap-2">
                <LinkButton
                  href={builderHref({ preset: preset.id })}
                  variant="ghost"
                  className={featured ? "border-inverse-line text-bg [a&]:hover:border-bg" : undefined}
                >
                  Настроить
                </LinkButton>
                {!compact && (
                  <LinkButton
                    href={orderHref(preset.selection, preset.title)}
                    className={featured ? "bg-bg text-ink [a&]:hover:bg-accent [a&]:hover:text-on-accent" : undefined}
                  >
                    Заказать
                  </LinkButton>
                )}
              </div>
            </div>
          </article>
        );
      })}
      {presets.length === 0 && (
        <p className="rounded-panel border border-line p-8 text-muted">
          Готовых сборок пока нет — соберите свою в <Link href="/builder">конструкторе</Link>.
        </p>
      )}
    </div>
  );
}
