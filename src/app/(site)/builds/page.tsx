import type { Metadata } from "next";
import { container } from "@/infrastructure/container";
import { PresetGrid } from "@/presentation/components/sections/Builds";
import { LinkButton } from "@/presentation/components/ui/Button";
import { Container, PageIntro } from "@/presentation/components/ui/Layout";
import { BUSINESS } from "@/presentation/content/business";

export const metadata: Metadata = {
  alternates: { canonical: "/builds" },
  title: "Готовые сборки — Proxima Computers",
  description: "Готовые конфигурации ПК с ценами в тенге: заказать как есть или поменять детали в конструкторе.",
};

export default async function BuildsPage() {
  const presets = await container.getPresetBuilds.execute();
  return (
    <>
      <PageIntro
        eyebrow="Готовые сборки"
        title="Готовые сборки"
        description={`Мы сами подобрали эти конфигурации и собирали их не раз. Все детали есть в наличии, в цене уже сборка, укладка кабелей и тест под нагрузкой ${BUSINESS.testHours} часа.`}
      />
      <Container className="pb-24">
        <PresetGrid presets={presets} />
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[560px] text-muted">
            Ни одна не подходит? Соберите свою из того, что есть в наличии, или просто напишите, что вам нужно.
          </p>
          <LinkButton href="/builder" variant="ghost">
            Открыть конструктор
          </LinkButton>
        </div>
      </Container>
    </>
  );
}
