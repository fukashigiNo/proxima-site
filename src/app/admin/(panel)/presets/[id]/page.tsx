import { notFound } from "next/navigation";
import { container } from "@/infrastructure/container";
import { PresetForm } from "@/presentation/components/admin/PresetForm";
import { PageTitle } from "../../PageTitle";

export default async function EditPresetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [catalog, preset] = await Promise.all([container.getCatalog.execute(), container.getPresetBuilds.findById(id)]);
  if (!preset) notFound();
  return (
    <>
      <PageTitle title={preset.title} description={`id: ${preset.id}`} />
      <PresetForm catalog={catalog} preset={preset} />
    </>
  );
}
