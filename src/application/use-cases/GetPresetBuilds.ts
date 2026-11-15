import type { BuildSelection, PresetBuild } from "@/domain/entities/Build";
import { selectComponent } from "@/domain/entities/Build";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";
import { evaluateBuild, type BuildSummary } from "./EvaluateBuild";

export interface PresetBuildView extends PresetBuild {
  readonly selection: BuildSelection;
  readonly summary: BuildSummary;
}

export class GetPresetBuilds {
  constructor(
    private readonly components: ComponentRepository,
    private readonly presets: PresetRepository,
  ) {}

  async execute(): Promise<PresetBuildView[]> {
    const presets = await this.presets.findAll();
    return Promise.all(presets.map((preset) => this.toView(preset)));
  }

  async findById(id: string): Promise<PresetBuildView | null> {
    const preset = await this.presets.findById(id);
    return preset ? this.toView(preset) : null;
  }

  private async toView(preset: PresetBuild): Promise<PresetBuildView> {
    const parts = await this.components.findByIds(preset.componentIds);
    const selection = parts.reduce<BuildSelection>(selectComponent, {});
    return { ...preset, selection, summary: evaluateBuild(selection) };
  }
}
