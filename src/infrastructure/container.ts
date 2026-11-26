import "server-only";
import { randomUUID } from "node:crypto";
import { ChangeRequestStatus } from "@/application/use-cases/admin/ChangeRequestStatus";
import { GetDashboard } from "@/application/use-cases/admin/GetDashboard";
import { CreateComponent, DeleteComponent, SetAvailability, UpdateComponent } from "@/application/use-cases/admin/ManageComponents";
import { DeletePreset, SavePreset } from "@/application/use-cases/admin/ManagePresets";
import { ListBuildRequests } from "@/application/use-cases/admin/ListBuildRequests";
import { UpdateOffer } from "@/application/use-cases/admin/UpdateOffer";
import { GetCatalog } from "@/application/use-cases/GetCatalog";
import { GetPresetBuilds } from "@/application/use-cases/GetPresetBuilds";
import { ResolveBuild } from "@/application/use-cases/ResolveBuild";
import { SubmitBuildRequest } from "@/application/use-cases/SubmitBuildRequest";
import { SubmitMessengerRequest } from "@/application/use-cases/SubmitMessengerRequest";
import { SubmitTelegramRequest } from "@/application/use-cases/SubmitTelegramRequest";
import type { PresetBuild } from "@/domain/entities/Build";
import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { PcComponent } from "@/domain/entities/PcComponent";
import { COMPONENTS, PRESETS } from "./data/catalog";
import { JsonFileStore, dataPath } from "./persistence/JsonFileStore";
import { FileBuildRequestRepository } from "./repositories/FileBuildRequestRepository";
import { FileComponentRepository } from "./repositories/FileComponentRepository";
import { FilePresetRepository } from "./repositories/FilePresetRepository";
import { ensureSchema, isPostgresEnabled } from "./persistence/postgres";
import { PgBotSessionRepository, PgBuildRequestRepository, PgComponentRepository, PgPresetRepository } from "./repositories/PgRepositories";
import { FileBotSessionRepository } from "./repositories/FileBotSessionRepository";
import type { BotSessionRepository } from "@/domain/repositories/BotSessionRepository";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";

function createRepositories(): {
  components: ComponentRepository;
  presets: PresetRepository;
  requests: BuildRequestRepository;
  botSessions: BotSessionRepository;
} {
  if (isPostgresEnabled()) {
    const ready = () => ensureSchema({ components: () => [...COMPONENTS], presets: () => [...PRESETS] });
    return {
      components: new PgComponentRepository(ready),
      presets: new PgPresetRepository(ready),
      requests: new PgBuildRequestRepository(ready),
      botSessions: new PgBotSessionRepository(ready),
    };
  }
  return {
    components: new FileComponentRepository(new JsonFileStore<PcComponent[]>(dataPath("components.json"), () => [...COMPONENTS])),
    presets: new FilePresetRepository(new JsonFileStore<PresetBuild[]>(dataPath("presets.json"), () => [...PRESETS])),
    requests: new FileBuildRequestRepository(new JsonFileStore<BuildRequest[]>(dataPath("requests.json"), () => [])),
    botSessions: new FileBotSessionRepository(new JsonFileStore<Record<string, unknown>>(dataPath("bot-sessions.json"), () => ({}))),
  };
}

const repositories = createRepositories();
const componentRepository = repositories.components;
const presetRepository = repositories.presets;
const buildRequestRepository = repositories.requests;
const newRequestId = () => `PX-${randomUUID().slice(0, 8).toUpperCase()}`;
const listBuildRequests = new ListBuildRequests(buildRequestRepository, componentRepository);

export const container = {
  getCatalog: new GetCatalog(componentRepository),
  getPresetBuilds: new GetPresetBuilds(componentRepository, presetRepository),
  resolveBuild: new ResolveBuild(componentRepository),
  submitBuildRequest: new SubmitBuildRequest(buildRequestRepository, componentRepository, newRequestId),
  submitMessengerRequest: new SubmitMessengerRequest(buildRequestRepository, componentRepository, newRequestId),
  submitTelegramRequest: new SubmitTelegramRequest(buildRequestRepository, componentRepository, newRequestId),
  botSessions: repositories.botSessions,
  admin: {
    listBuildRequests,
    changeRequestStatus: new ChangeRequestStatus(buildRequestRepository),
    updateOffer: new UpdateOffer(componentRepository),
    createComponent: new CreateComponent(componentRepository),
    updateComponent: new UpdateComponent(componentRepository),
    deleteComponent: new DeleteComponent(componentRepository, presetRepository),
    setAvailability: new SetAvailability(componentRepository),
    savePreset: new SavePreset(presetRepository, componentRepository),
    deletePreset: new DeletePreset(presetRepository),
    getDashboard: new GetDashboard(listBuildRequests, componentRepository),
  },
} as const;
