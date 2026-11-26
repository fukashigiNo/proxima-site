import "server-only";
import type { BotSessionRepository } from "@/domain/repositories/BotSessionRepository";
import type { JsonFileStore } from "../persistence/JsonFileStore";

export class FileBotSessionRepository implements BotSessionRepository {
  constructor(private readonly store: JsonFileStore<Record<string, unknown>>) {}

  async get(key: string) {
    return (await this.store.read())[key];
  }

  async set(key: string, data: unknown) {
    await this.store.update((all) => ({ ...all, [key]: data }));
  }

  async delete(key: string) {
    await this.store.update((all) => {
      const { [key]: _, ...rest } = all;
      return rest;
    });
  }
}
