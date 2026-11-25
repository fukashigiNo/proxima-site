"use client";

import { useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { BUSINESS } from "@/presentation/content/business";
import { SERVICE_FACTS } from "@/presentation/content/facts";
import { builderHref } from "@/presentation/lib/routes";
import { useBuild } from "@/presentation/state/BuildContext";
import { PcSceneLazy } from "../three/PcSceneLazy";
import { toVisualSpec } from "../three/visualSpec";
import { LinkButton } from "../ui/Button";
import { Container } from "../ui/Layout";
import { Note } from "../ui/Note";

const PART_START: Record<ComponentCategory, number> = {
  case: 0,
  motherboard: 0.05,
  cpu: 0.12,
  cooling: 0.2,
  ram: 0.28,
  storage: 0.34,
  gpu: 0.4,
  psu: 0.45,
};

export function Hero({ presetId }: { presetId?: string }) {
  const router = useRouter();
  const section = useRef<HTMLElement>(null);
  const { selection, summary, presetTitle } = useBuild();
  const spec = useMemo(() => toVisualSpec(selection), [selection]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const explode = useTransform(scrollYProgress, [0.04, 0.8], [0, 1], { clamp: true });
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const listOpacity = useTransform(scrollYProgress, [0.06, 0.16], [0, 1]);

  const openPart = (category: ComponentCategory) => router.push(builderHref({ preset: presetId, focus: category }));

  return (
    <section ref={section} className="relative -mt-[var(--header-h)] h-[230vh] max-lg:h-[190vh]">
      <div className="sticky top-0 h-svh overflow-hidden pt-[var(--header-h)]">
        <Container className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-12 gap-y-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-[minmax(0,1fr)_auto] lg:py-8">
          <div className="grid min-h-0 content-center gap-4">
            <p className="animate-rise text-[15px] text-muted max-lg:[@media(max-height:760px)]:hidden">
              Собираем компьютеры в {BUSINESS.baseCity}, отправляем по всему Казахстану
            </p>
            <h1 className="animate-rise text-[clamp(32px,min(4.2vw,6.4vh),64px)] font-semibold leading-[1.04] tracking-[-0.04em] [animation-delay:60ms]">
              Соберём компьютер под ваши задачи и&nbsp;бюджет
            </h1>
            <p className="max-w-[500px] animate-rise text-[17px] leading-relaxed text-muted [animation-delay:140ms] max-sm:hidden [@media(max-height:700px)]:hidden">
              Подбираем железо из того, что реально есть на складах, собираем руками и гоняем под нагрузкой{" "}
              {BUSINESS.testHours}&nbsp;часа. Вам остаётся воткнуть кабель и включить.
            </p>
            <div className="flex animate-rise flex-wrap gap-3 [animation-delay:200ms]">
              <LinkButton href="/builder">Собрать свой ПК</LinkButton>
              <LinkButton href="/builds" variant="ghost">
                Посмотреть готовые
              </LinkButton>
            </div>
          </div>

          <div className="relative min-h-0 animate-scale-in [animation-delay:150ms] lg:row-span-2">
            <PcSceneLazy
              className="size-full rounded-panel"
              spec={spec}
              conflicts={summary.conflictCategories}
              onPartSelect={openPart}
              explode={explode}
            />
            <m.div style={{ opacity: hintOpacity }} className="absolute left-2 top-2 max-md:hidden">
              <Note arrow="down-right" rotate={-4}>
                это {presetTitle ?? "наша сборка"}, её можно покрутить
              </Note>
            </m.div>
            <m.ul
              style={{ opacity: listOpacity }}
              className="pointer-events-none absolute right-3 top-3 hidden gap-1 rounded-card bg-bg/70 px-4 py-3 text-[13px] md:grid"
            >
              {COMPONENT_CATEGORIES.map((category) => (
                <PartRow
                  key={category}
                  progress={explode}
                  start={PART_START[category]}
                  label={CATEGORY_LABELS[category]}
                  name={selection[category]?.name ?? "—"}
                />
              ))}
            </m.ul>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 max-lg:[@media(max-height:760px)]:hidden">
            <dl className="flex gap-8">
              {SERVICE_FACTS.map((fact, i) => (
                <div key={fact.label} className="animate-rise" style={{ animationDelay: `${260 + i * 70}ms` }}>
                  <dt className="text-[24px] font-semibold tracking-[-0.03em]">{fact.value}</dt>
                  <dd className="max-w-[130px] text-[13px] leading-snug text-muted">{fact.label}</dd>
                </div>
              ))}
            </dl>
            <m.div style={{ opacity: hintOpacity }} className="max-lg:hidden">
              <Note arrow="down" rotate={2} className="mb-10 mr-6">
                листайте, разберём его по деталям
              </Note>
            </m.div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function PartRow({ progress, start, label, name }: { progress: MotionValue<number>; start: number; label: string; name: string }) {
  const opacity = useTransform(progress, [start, start + 0.12], [0.35, 1]);
  return (
    <m.li style={{ opacity }} className="flex items-baseline justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="max-w-[210px] truncate">{name}</span>
    </m.li>
  );
}
