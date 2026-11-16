import type { Metadata } from "next";
import { container } from "@/infrastructure/container";
import { Builder } from "@/presentation/components/builder/Builder";
import { PageIntro } from "@/presentation/components/ui/Layout";
import { parseCategory, parseParts } from "@/presentation/lib/routes";
import { BuildProvider } from "@/presentation/state/BuildContext";

export const metadata: Metadata = {
  alternates: { canonical: "/builder" },
  title: "Конструктор ПК — Proxima Computers",
  description: "Соберите компьютер из комплектующих в наличии в Алматы, Астане и Шымкенте. Цены в тенге, 3D-модель и проверка совместимости.",
};

interface Props {
  searchParams: Promise<{ preset?: string; parts?: string; focus?: string }>;
}

export default async function BuilderPage({ searchParams }: Props) {
  const { preset, parts, focus } = await searchParams;
  const ids = parseParts(parts);
  const [catalog, presets, initialPreset, partsSelection] = await Promise.all([
    container.getCatalog.execute(),
    container.getPresetBuilds.execute(),
    preset && ids.length === 0 ? container.getPresetBuilds.findById(preset) : Promise.resolve(null),
    container.resolveBuild.execute(ids),
  ]);

  return (
    <BuildProvider
      initial={initialPreset?.selection ?? partsSelection}
      initialTitle={initialPreset?.title}
      initialCategory={parseCategory(focus)}
    >
      <PageIntro
        eyebrow="Конструктор"
        title="Соберите компьютер сами"
        description="Здесь только то, что сейчас лежит на складах в Алматы, Астане и Шымкенте. Выбирайте детали, а конструктор подскажет, если что-то не подойдёт: сокет, память, размеры, мощность блока питания."
      />
      <Builder catalog={catalog} presets={presets} />
    </BuildProvider>
  );
}
