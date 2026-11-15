"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { ComponentCategory } from "@/domain/entities/PcComponent";
import { SERVICE_FACTS } from "@/presentation/content/facts";
import { builderHref } from "@/presentation/lib/routes";
import { useBuild } from "@/presentation/state/BuildContext";
import { PcSceneLazy } from "../three/PcSceneLazy";
import { toVisualSpec } from "../three/visualSpec";
import { LinkButton } from "../ui/Button";
import { Container, Eyebrow } from "../ui/Layout";

/** Первый экран главной: 3D-модель витринной сборки; клик по детали открывает её в конструкторе. */
export function Hero({ presetId }: { presetId?: string }) {
  const router = useRouter();
  const { selection, summary } = useBuild();
  const spec = useMemo(() => toVisualSpec(selection), [selection]);

  const openPart = (category: ComponentCategory) => router.push(builderHref({ preset: presetId, focus: category }));

  return (
    <section className="border-b border-line pb-24 pt-16">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 [grid-template-areas:'copy'_'stage'_'facts'] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:[grid-template-areas:'copy_stage'_'facts_stage']">
        <div className="grid gap-7 [grid-area:copy]">
          <Eyebrow>Сборка компьютеров · Казахстан</Eyebrow>
          <h1 className="text-[clamp(44px,6.4vw,88px)] font-medium leading-[0.98] tracking-[-0.045em]">
            Компьютер, собранный <em className="not-italic text-accent">точно</em> под&nbsp;ваши задачи.
          </h1>
          <p className="max-w-[500px] text-lg leading-relaxed text-muted">
            Подбираем совместимые комплектующие, аккуратно собираем, прокладываем кабели и тестируем под нагрузкой — до того,
            как ПК окажется у вас.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/builder">Открыть конструктор</LinkButton>
            <LinkButton href="/builds" variant="ghost">
              Готовые сборки
            </LinkButton>
          </div>
        </div>

        <div className="relative [grid-area:stage]">
          <PcSceneLazy
            className="bg-surface h-[360px] rounded-panel sm:h-[460px] lg:h-[min(72vh,680px)] lg:min-h-[420px]"
            spec={spec}
            conflicts={summary.conflictCategories}
            onPartSelect={openPart}
          />
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-xs text-muted">
            Потяните, чтобы повернуть · нажмите на деталь
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-6 self-end border-t border-line pt-8 [grid-area:facts] sm:grid-cols-3">
          {SERVICE_FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[28px] font-medium tracking-[-0.03em]">{fact.value}</dt>
              <dd className="mt-1 text-sm leading-snug text-muted">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
