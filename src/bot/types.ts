import type { Catalog } from "@/application/use-cases/GetCatalog";
import type { PresetBuildView } from "@/application/use-cases/GetPresetBuilds";
import type { BuildRequest, TelegramRequestInput } from "@/domain/entities/BuildRequest";
import type { ComponentCategory } from "@/domain/entities/PcComponent";
import type { BotSessionRepository } from "@/domain/repositories/BotSessionRepository";

export type OrderTarget = { kind: "build" } | { kind: "preset"; id: string } | { kind: "item"; id: string } | { kind: "consult" };

export interface OrderFlow {
  step: "name" | "contact" | "comment" | "confirm";
  target: OrderTarget;
  name?: string;
  contact?: string;
  comment?: string;
}

export interface BotSession {
  build: Partial<Record<ComponentCategory, string>>;
  buildTitle?: string | null;
  flow?: OrderFlow;
}

export interface BotDeps {
  getCatalog(): Promise<Catalog>;
  getPresets(): Promise<PresetBuildView[]>;
  submitRequest(input: TelegramRequestInput): Promise<BuildRequest>;
  sessions: BotSessionRepository;
  siteUrl: string;
  managerChatId?: string;
}
