import Link from "next/link";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import { cn } from "@/presentation/lib/cn";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";
import { Reveal } from "../motion/Reveal";
import { OrderButton } from "../order/OrderButton";
import { Tilt } from "../motion/Tilt";
import { LinkButton } from "../ui/Button";

export function PresetGrid({ presets, compact = false }: { presets: PresetBuildView[]; compact?: boolean }) {
  const featuredIndex = presets.length >= 3 ? 1 : -1;
  return (
    <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
      {presets.map((preset, i) => {
        const featured = i === featuredIndex;
        const categories = compact ? (["cpu", "gpu", "ram", "storage"] as const) : COMPONENT_CATEGORIES;
        return (
          <Reveal key={preset.id} delay={i * 120} className={cn("grid", featured && "glow-border rounded-panel")}>
            {featured && <span className="glow-border-ring" aria-hidden />}
            {featured && <span className="glow-border-halo" aria-hidden />}
            <Tilt className="grid rounded-panel" max={4}>
              <article
                className={cn(
                  "flex flex-col gap-4 rounded-panel border bg-surface/70 p-8 transition-colors duration-300",
                  featured ? "border-transparent bg-surface" : "border-line hover:border-line-strong",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-2">{preset.tagline}</p>
                  {featured && (
                    <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-on-accent shadow-[0_0_20px_var(--glow)]">
                      Хит
                    </span>
                  )}
                </div>
                <h2 className="text-[32px] font-semibold tracking-[-0.035em]">{preset.title}</h2>
                <p className="leading-normal text-muted">{preset.purpose}</p>
                <dl className="mt-2 grid gap-2.5 border-y border-line py-5 text-[15px]">
                  {categories.map((category) => {
                    const part = preset.selection[category];
                    if (!part) return null;
                    return (
                      <div key={category} className="grid gap-0.5">
                        {!compact && (
                          <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{CATEGORY_LABELS[category]}</dt>
                        )}
                        <dd>
                          <span className="text-muted">{part.brand}</span> {part.name}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {!compact && (
                  <p className="font-mono text-[12px] text-muted">
                    ≈ {formatWatts(preset.summary.powerDraw)} · сборка и тест включены
                  </p>
                )}
                <div className="mt-auto grid gap-4 pt-2">
                  <p className="text-[28px] font-semibold tracking-[-0.03em]">{formatPrice(preset.summary.total)}</p>
                  <div className="flex flex-wrap gap-2">
                    {!compact && (
                      <OrderButton selection={preset.selection} title={preset.title} variant={featured ? "primary" : "ghost"} className="flex-1">
                        Заказать
                      </OrderButton>
                    )}
                    <LinkButton href={builderHref({ preset: preset.id })} variant="ghost" className="flex-1">
                      Настроить
                    </LinkButton>
                  </div>
                </div>
              </article>
            </Tilt>
          </Reveal>
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
