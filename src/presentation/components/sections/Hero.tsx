"use client";

import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useRef } from "react";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { SERVICE_FACTS } from "@/presentation/content/facts";
import { formatPrice } from "@/presentation/lib/format";
import { builderHref } from "@/presentation/lib/routes";
import { useBuild } from "@/presentation/state/BuildContext";
import { CountUp } from "../motion/CountUp";
import { PcSceneLazy } from "../three/PcSceneLazy";
import { toVisualSpec } from "../three/visualSpec";
import { LinkButton } from "../ui/Button";
import { Container } from "../ui/Layout";

const HEADLINE: { text: string; accent?: boolean }[] = [
  { text: "Компьютер," },
  { text: "собранный" },
  { text: "точно", accent: true },
  { text: "под ваши" },
  { text: "задачи." },
];

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
  const readout = useRef<HTMLSpanElement>(null);
  const { selection, summary, presetTitle } = useBuild();
  const spec = useMemo(() => toVisualSpec(selection), [selection]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const explode = useTransform(scrollYProgress, [0.04, 0.8], [0, 1], { clamp: true });
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const barScale = explode;

  useMotionValueEvent(explode, "change", (v) => {
    if (readout.current) readout.current.textContent = `${String(Math.round(v * 100)).padStart(3, "0")}%`;
  });

  const openPart = (category: ComponentCategory) => router.push(builderHref({ preset: presetId, focus: category }));

  return (
    <section ref={section} className="relative -mt-[var(--header-h)] h-[230vh] max-lg:h-[190vh]">
      <div className="sticky top-0 h-dvh overflow-hidden pt-[var(--header-h)]">
        <Container className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-10 gap-y-4 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:grid-rows-[minmax(0,1fr)_auto] lg:py-10">
          <div className="grid content-center gap-4 lg:gap-6">
            <p className="flex animate-rise items-center gap-3 font-mono text-[12px] uppercase tracking-[0.14em] text-muted">
              <span className="size-2 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]" aria-hidden />
              Сборка ПК · Казахстан
            </p>
            <h1 className="text-[clamp(38px,min(6vw,8.2vh),92px)] font-semibold leading-[0.95] tracking-[-0.05em]">
              {HEADLINE.map((word, i) => (
                <Fragment key={word.text}>
                  <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
                    <span
                      className={`inline-block animate-word ${word.accent ? "text-glow text-accent" : ""}`}
                      style={{ animationDelay: `${80 + i * 70}ms` }}
                    >
                      {word.text}
                    </span>
                  </span>
                  {i < HEADLINE.length - 1 && " "}
                </Fragment>
              ))}
            </h1>
            <p className="max-w-[480px] animate-rise text-[17px] leading-relaxed text-muted [animation-delay:450ms] max-sm:hidden">
              Подбираем совместимые комплектующие, собираем вручную и гоняем 72 часа под нагрузкой — до того, как ПК окажется у вас.
            </p>
            <div className="flex animate-rise flex-wrap gap-3 [animation-delay:550ms]">
              <LinkButton href="/builder" magnetic>
                Собрать свой ПК
              </LinkButton>
              <LinkButton href="/builds" variant="ghost" magnetic>
                Готовые сборки
              </LinkButton>
            </div>
          </div>

          <div className="relative min-h-0 animate-scale-in [animation-delay:200ms] lg:row-span-2">
            <PcSceneLazy
              className="hud-frame size-full rounded-panel"
              spec={spec}
              conflicts={summary.conflictCategories}
              onPartSelect={openPart}
              explode={explode}
            />
            <div className="pointer-events-none absolute left-4 top-4 grid gap-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              <span>
                <span className="text-accent-2">model</span> {presetTitle ?? "Proxima"}
              </span>
              <span>
                <span className="text-accent-2">total</span> {formatPrice(summary.total)}
              </span>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              <div className="flex justify-between">
                <span>Разбор</span>
                <span ref={readout} className="tabular-nums text-ink">
                  000%
                </span>
              </div>
              <div className="h-px overflow-hidden bg-line-strong">
                <m.div className="h-full origin-left bg-accent shadow-[0_0_12px_var(--glow)]" style={{ scaleX: barScale }} />
              </div>
            </div>
            <ul className="pointer-events-none absolute right-4 top-4 hidden gap-1.5 text-right font-mono text-[11px] uppercase tracking-[0.06em] md:grid">
              {COMPONENT_CATEGORIES.map((category) => (
                <HudRow
                  key={category}
                  progress={explode}
                  start={PART_START[category]}
                  label={CATEGORY_LABELS[category]}
                  name={selection[category]?.name ?? "—"}
                />
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <dl className="flex gap-8">
              {SERVICE_FACTS.map((fact, i) => (
                <div key={fact.label} className="animate-rise" style={{ animationDelay: `${650 + i * 90}ms` }}>
                  <dt className="text-[26px] font-semibold tracking-[-0.03em]">
                    <CountUp value={fact.value} />
                  </dt>
                  <dd className="max-w-[120px] text-[12px] leading-snug text-muted">{fact.label}</dd>
                </div>
              ))}
            </dl>
            <m.p style={{ opacity: hintOpacity }} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted max-lg:hidden">
              <span className="relative h-8 w-px overflow-hidden bg-line-strong">
                <span className="absolute inset-x-0 top-0 h-3 animate-[scroll-hint_1.6s_ease-in-out_infinite] bg-accent" />
              </span>
              Прокрутите — разберём ПК
            </m.p>
          </div>
        </Container>
      </div>
    </section>
  );
}

function HudRow({ progress, start, label, name }: { progress: MotionValue<number>; start: number; label: string; name: string }) {
  const opacity = useTransform(progress, [start, start + 0.12], [0.35, 1]);
  const x = useTransform(progress, [start, start + 0.12], [8, 0]);
  const color = useTransform(progress, (v) => (v > start + 0.06 ? "var(--ink)" : "var(--muted)"));
  return (
    <m.li style={{ opacity, x, color }} className="flex items-center justify-end gap-2">
      <span className="max-w-[200px] truncate normal-case tracking-normal">{name}</span>
      <span className="text-accent-2">{label}</span>
    </m.li>
  );
}
