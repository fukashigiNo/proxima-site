import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/domain/entities/PcComponent";
import { ComponentForm } from "@/presentation/components/admin/ComponentForm";
import { PageTitle } from "../../PageTitle";

export default async function NewComponentPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initial = COMPONENT_CATEGORIES.includes(category as ComponentCategory) ? (category as ComponentCategory) : "cpu";
  return (
    <>
      <PageTitle title="Новая позиция" description="Технические параметры используются в проверке совместимости и 3D-модели" />
      <ComponentForm defaultCategory={initial} />
    </>
  );
}
