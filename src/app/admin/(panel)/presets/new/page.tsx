import { container } from "@/infrastructure/container";
import { PresetForm } from "@/presentation/components/admin/PresetForm";
import { PageTitle } from "../../PageTitle";

export default async function NewPresetPage() {
  const catalog = await container.getCatalog.execute();
  return (
    <>
      <PageTitle title="Новая сборка" />
      <PresetForm catalog={catalog} />
    </>
  );
}
