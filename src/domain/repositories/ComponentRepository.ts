import type { PcComponent } from "../entities/PcComponent";

export interface ComponentRepository {
  findAll(): Promise<PcComponent[]>;
  findByIds(ids: readonly string[]): Promise<PcComponent[]>;
  create(component: PcComponent): Promise<void>;
  update(component: PcComponent): Promise<void>;
  delete(id: string): Promise<void>;
}
