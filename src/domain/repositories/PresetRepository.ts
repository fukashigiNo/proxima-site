import type { PresetBuild } from "../entities/Build";

export interface PresetRepository {
  findAll(): Promise<PresetBuild[]>;
  findById(id: string): Promise<PresetBuild | null>;
  save(preset: PresetBuild): Promise<void>;
  delete(id: string): Promise<void>;
}
