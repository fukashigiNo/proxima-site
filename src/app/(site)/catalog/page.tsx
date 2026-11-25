import type { Metadata } from "next";
import { COMPONENT_CATEGORIES, type PcComponent } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { CatalogView } from "@/presentation/components/catalog/CatalogView";
import { Container, PageIntro } from "@/presentation/components/ui/Layout";
import { parseCatalogQuery, type RawParams } from "@/presentation/lib/catalogQuery";

export const metadata: Metadata = {
  alternates: { canonical: "/catalog" },
  title: "Каталог комплектующих — Proxima Computers",
  description: "Процессоры, видеокарты, материнские платы, память, накопители, охлаждение, блоки питания и корпуса с ценами в тенге и наличием по городам.",
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [catalog, params] = await Promise.all([container.getCatalog.execute(), searchParams]);
  const items = COMPONENT_CATEGORIES.flatMap((category): PcComponent[] => catalog[category]);

  return (
    <>
      <PageIntro
        eyebrow="Каталог"
        title="Каталог"
        description="Все комплектующие, из которых мы собираем компьютеры. Цены в тенге, наличие по Алматы, Астане и Шымкенту. Любую деталь можно сразу отправить в конструктор."
      />
      <Container className="pb-24">
        <CatalogView items={items} initialQuery={parseCatalogQuery(params)} />
      </Container>
    </>
  );
}
