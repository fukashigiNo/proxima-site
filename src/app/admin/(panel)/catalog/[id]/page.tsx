import { notFound } from "next/navigation";
import { CATEGORY_LABELS } from "@/domain/entities/PcComponent";
import { container } from "@/infrastructure/container";
import { ComponentForm } from "@/presentation/components/admin/ComponentForm";
import { PageTitle } from "../../PageTitle";

export default async function EditComponentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const [catalog, presets] = await Promise.all([container.getCatalog.execute(), container.getPresetBuilds.execute()]);
  const component = Object.values(catalog).flat().find((c) => c.id === id);
  if (!component) notFound();
  const usedIn = presets.filter((p) => p.componentIds.includes(id)).map((p) => p.title);

  return (
    <>
      <PageTitle title={`${component.brand} ${component.name}`} description={`${CATEGORY_LABELS[component.category]} · ${component.id}`} />
      <ComponentForm component={component} usedInPresets={usedIn} created={created === "1"} />
    </>
  );
}
