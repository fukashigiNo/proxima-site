import type { PcComponent } from "../entities/PcComponent";

/** Порт (интерфейс) хранилища каталога. Реализация — в infrastructure. */
export interface ComponentRepository {
  findAll(): Promise<PcComponent[]>;
  findByIds(ids: readonly string[]): Promise<PcComponent[]>;
  create(component: PcComponent): Promise<void>;
  /** Заменяет комплектующее с тем же id */
  update(component: PcComponent): Promise<void>;
  delete(id: string): Promise<void>;
}
