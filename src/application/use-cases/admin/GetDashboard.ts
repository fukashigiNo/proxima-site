import { REQUEST_STATUSES, type RequestStatus } from "@/domain/entities/BuildRequest";
import { totalStock, type PcComponent } from "@/domain/entities/PcComponent";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { ListBuildRequests, BuildRequestView } from "./ListBuildRequests";

export const LOW_STOCK_THRESHOLD = 3;

export interface Dashboard {
  readonly byStatus: Record<RequestStatus, number>;
  readonly totalByStatus: Record<RequestStatus, number>;
  readonly recent: BuildRequestView[];
  readonly lowStock: PcComponent[];
  readonly outOfStock: number;
  readonly catalogSize: number;
}

export class GetDashboard {
  constructor(
    private readonly listRequests: ListBuildRequests,
    private readonly components: ComponentRepository,
  ) {}

  async execute(): Promise<Dashboard> {
    const [requests, catalog] = await Promise.all([this.listRequests.execute(), this.components.findAll()]);
    const zero = () => Object.fromEntries(REQUEST_STATUSES.map((s) => [s, 0])) as Record<RequestStatus, number>;
    const byStatus = zero();
    const totalByStatus = zero();
    for (const r of requests) {
      byStatus[r.status] += 1;
      totalByStatus[r.status] += r.summary?.total ?? 0;
    }

    return {
      byStatus,
      totalByStatus,
      recent: requests.slice(0, 5),
      lowStock: catalog
        .filter((c) => totalStock(c) < LOW_STOCK_THRESHOLD)
        .sort((a, b) => totalStock(a) - totalStock(b))
        .slice(0, 8),
      outOfStock: catalog.filter((c) => totalStock(c) === 0).length,
      catalogSize: catalog.length,
    };
  }
}
