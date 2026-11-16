import "server-only";
import { randomUUID } from "node:crypto";
import { ChangeRequestStatus } from "@/application/use-cases/admin/ChangeRequestStatus";
import { GetDashboard } from "@/application/use-cases/admin/GetDashboard";
import { CreateComponent, DeleteComponent, UpdateComponent } from "@/application/use-cases/admin/ManageComponents";
import { DeletePreset, SavePreset } from "@/application/use-cases/admin/ManagePresets";
import { ListBuildRequests } from "@/application/use-cases/admin/ListBuildRequests";
import { UpdateOffer } from "@/application/use-cases/admin/UpdateOffer";
import { GetCatalog } from "@/application/use-cases/GetCatalog";
import { GetPresetBuilds } from "@/application/use-cases/GetPresetBuilds";
import { ResolveBuild } from "@/application/use-cases/ResolveBuild";
import { SubmitBuildRequest } from "@/application/use-cases/SubmitBuildRequest";
import { SubmitMessengerRequest } from "@/application/use-cases/SubmitMessengerRequest";
import type { PresetBuild } from "@/domain/entities/Build";
import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { PcComponent } from "@/domain/entities/PcComponent";
import { COMPONENTS, PRESETS } from "./data/catalog";
import { JsonFileStore, dataPath } from "./persistence/JsonFileStore";
import { FileBuildRequestRepository } from "./repositories/FileBuildRequestRepository";
import { FileComponentRepository } from "./repositories/FileComponentRepository";
import { FilePresetRepository } from "./repositories/FilePresetRepository";

const componentRepository = new FileComponentRepository(
  new JsonFileStore<PcComponent[]>(dataPath("components.json"), () => [...COMPONENTS]),
);
const presetRepository = new FilePresetRepository(
  new JsonFileStore<PresetBuild[]>(dataPath("presets.json"), () => [...PRESETS]),
);
const buildRequestRepository = new FileBuildRequestRepository(
  new JsonFileStore<BuildRequest[]>(dataPath("requests.json"), () => []),
);
const newRequestId = () => `PX-${randomUUID().slice(0, 8).toUpperCase()}`;
const listBuildRequests = new ListBuildRequests(buildRequestRepository, componentRepository);

export const container = {
  getCatalog: new GetCatalog(componentRepository),
  getPresetBuilds: new GetPresetBuilds(componentRepository, presetRepository),
  resolveBuild: new ResolveBuild(componentRepository),
  submitBuildRequest: new SubmitBuildRequest(buildRequestRepository, componentRepository, newRequestId),
  submitMessengerRequest: new SubmitMessengerRequest(buildRequestRepository, componentRepository, newRequestId),
  admin: {
    listBuildRequests,
    changeRequestStatus: new ChangeRequestStatus(buildRequestRepository),
    updateOffer: new UpdateOffer(componentRepository),
    createComponent: new CreateComponent(componentRepository),
    updateComponent: new UpdateComponent(componentRepository),
    deleteComponent: new DeleteComponent(componentRepository, presetRepository),
    savePreset: new SavePreset(presetRepository, componentRepository),
    deletePreset: new DeletePreset(presetRepository),
    getDashboard: new GetDashboard(listBuildRequests, componentRepository),
  },
} as const;
