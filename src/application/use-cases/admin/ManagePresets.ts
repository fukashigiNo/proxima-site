import { selectComponent, validatePresetFields, type BuildSelection, type PresetBuild } from "@/domain/entities/Build";
import { DomainError, ValidationError } from "@/domain/entities/BuildRequest";
import { makeComponentId } from "@/domain/entities/ComponentRules";
import { CATEGORY_LABELS, COMPONENT_CATEGORIES } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";
import { evaluateBuild } from "../EvaluateBuild";

export type PresetInput = Omit<PresetBuild, "id"> & { id?: string };

export class SavePreset {
  constructor(
    private readonly presets: PresetRepository,
    private readonly components: ComponentRepository,
  ) {}

  async execute(input: PresetInput): Promise<PresetBuild> {
    const errors = validatePresetFields(input);
    const parts = await this.components.findByIds(input.componentIds);
    if (parts.length !== input.componentIds.length) errors.components = "Некоторые позиции не найдены в каталоге";

    const selection = parts.reduce<BuildSelection>(selectComponent, {});
    for (const category of COMPONENT_CATEGORIES) {
      if (!selection[category]) errors[`component.${category}`] = `Выберите: ${CATEGORY_LABELS[category].toLowerCase()}`;
    }
    const conflicts = evaluateBuild(selection).issues.filter((i) => i.severity === "error");
    if (conflicts.length > 0) errors.components = conflicts.map((i) => i.message).join("; ");
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);

    let id = input.id;
    if (id) {
      if (!(await this.presets.findById(id))) throw new DomainError("Сборка не найдена");
    } else {
      const taken = new Set((await this.presets.findAll()).map((p) => `preset-${p.id}`));
      id = makeComponentId("preset", input.title, taken).replace(/^preset-/, "");
    }
    const preset: PresetBuild = {
      id,
      title: input.title.trim(),
      tagline: input.tagline.trim(),
      purpose: input.purpose.trim(),
      componentIds: COMPONENT_CATEGORIES.map((c) => selection[c]!.id),
    };
    await this.presets.save(preset);
    return preset;
  }
}

export class DeletePreset {
  constructor(private readonly presets: PresetRepository) {}

  async execute(id: string) {
    if (!(await this.presets.findById(id))) throw new DomainError("Сборка не найдена");
    await this.presets.delete(id);
  }
}
