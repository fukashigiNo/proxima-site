import { selectComponent, type BuildSelection } from "@/domain/entities/Build";
import type { BuildRequest, RequestStatus } from "@/domain/entities/BuildRequest";
import type { PcComponent } from "@/domain/entities/PcComponent";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import { evaluateBuild, type BuildSummary } from "../EvaluateBuild";

export interface BuildRequestView extends BuildRequest {
  readonly components: PcComponent[];
  readonly summary: BuildSummary | null;
}

export class ListBuildRequests {
  constructor(
    private readonly requests: BuildRequestRepository,
    private readonly components: ComponentRepository,
  ) {}

  async execute(filter?: { status?: RequestStatus }): Promise<BuildRequestView[]> {
    const [requests, catalog] = await Promise.all([this.requests.findAll(), this.components.findAll()]);
    const byId = new Map(catalog.map((c) => [c.id, c]));
    return requests
      .filter((r) => !filter?.status || r.status === filter.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((request) => {
        const components = request.componentIds.map((id) => byId.get(id)).filter((c): c is PcComponent => Boolean(c));
        const selection = components.reduce<BuildSelection>(selectComponent, {});
        return { ...request, components, summary: components.length ? evaluateBuild(selection) : null };
      });
  }
}
