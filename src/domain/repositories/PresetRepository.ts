import type { PresetBuild } from "../entities/Build";

/** Порт хранилища готовых сборок. */
export interface PresetRepository {
  findAll(): Promise<PresetBuild[]>;
  findById(id: string): Promise<PresetBuild | null>;
  /** Создаёт или обновляет сборку */
  save(preset: PresetBuild): Promise<void>;
  delete(id: string): Promise<void>;
}
