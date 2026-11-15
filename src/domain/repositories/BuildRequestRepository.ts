import type { BuildRequest } from "../entities/BuildRequest";

export interface BuildRequestRepository {
  save(request: BuildRequest): Promise<void>;
  findAll(): Promise<BuildRequest[]>;
  findById(id: string): Promise<BuildRequest | null>;
}
