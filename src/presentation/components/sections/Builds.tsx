import Link from "next/link";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import { formatPrice, formatWatts } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";
import { OrderButton } from "../order/OrderButton";
import { LinkButton } from "../ui/Button";

const KEY_PARTS = [
  { category: "cpu", label: "Процессор" },
  { category: "gpu", label: "Видеокарта" },
  { category: "ram", label: "Память" },
  { category: "storage", label: "Диск" },
] as const;

export function PresetGrid({ presets }: { presets: PresetBuildView[] }) {
  if (presets.length === 0) {
    return (
      <p className="border-y border-line py-10 text-muted">
        Готовых сборок пока нет. Соберите свою в <Link href="/builder">конструкторе</Link> или напишите нам.
      </p>
    );
  }

  return (
    <div className="border-t border-line">
      {presets.map((preset) => (
        <article
          key={preset.id}
          className="grid gap-6 border-b border-line py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto] lg:gap-12"
        >
          <div className="grid content-start gap-2">
            <h2 className="text-[28px] font-semibold tracking-[-0.03em]">{preset.title}</h2>
            <p className="text-[15px] text-accent">{preset.tagline}</p>
            <p className="max-w-[360px] leading-relaxed text-muted">{preset.purpose}</p>
          </div>

          <div className="grid content-start gap-3">
          <dl className="grid content-start gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
            {KEY_PARTS.map(({ category, label }) => {
              const part = preset.selection[category];
              if (!part) return null;
              return (
                <div key={category}>
                  <dt className="text-[13px] text-muted">{label}</dt>
                  <dd>
                    {part.brand} {part.name}
                  </dd>
                </div>
              );
            })}
          </dl>
            <Link href={builderHref({ preset: preset.id })} className="text-[14px] text-muted underline-offset-4 hover:text-ink">
              Весь состав, около {formatWatts(preset.summary.powerDraw)} под нагрузкой
            </Link>
          </div>

          <div className="grid content-start gap-4 lg:min-w-[230px] lg:justify-items-end">
            <p className="text-[28px] font-semibold tracking-[-0.03em]">{formatPrice(preset.summary.total)}</p>
            <p className="-mt-3 text-[13px] text-muted">со сборкой и тестом</p>
            <div className="flex flex-wrap gap-2">
              <OrderButton selection={preset.selection} title={preset.title}>
                Заказать
              </OrderButton>
              <LinkButton href={builderHref({ preset: preset.id })} variant="ghost">
                Поменять детали
              </LinkButton>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
