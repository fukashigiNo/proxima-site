import type { Metadata } from "next";
import { container } from "@/infrastructure/container";
import { PresetGrid } from "@/presentation/components/sections/Builds";
import { Container, PageIntro } from "@/presentation/components/ui/Layout";
import { LinkButton } from "@/presentation/components/ui/Button";

export const metadata: Metadata = {
  title: "Готовые сборки — Proxima Computers",
  description: "Проверенные конфигурации ПК с ценами в тенге: заказать как есть или донастроить в конструкторе.",
};

export default async function BuildsPage() {
  const presets = await container.getPresetBuilds.execute();
  return (
    <>
      <PageIntro
        eyebrow="Готовые сборки"
        title="Проверенные конфигурации."
        description="Каждая сборка совместима, сбалансирована и в наличии. Цена включает сборку, укладку кабелей и 72-часовой тест."
      />
      <Container className="pb-24">
        <PresetGrid presets={presets} />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-panel bg-surface px-8 py-7">
          <p className="max-w-[560px] text-muted">Не нашли подходящую? Соберите свою из комплектующих в наличии — совместимость проверим автоматически.</p>
          <LinkButton href="/builder" variant="ghost">Открыть конструктор</LinkButton>
        </div>
      </Container>
    </>
  );
}
