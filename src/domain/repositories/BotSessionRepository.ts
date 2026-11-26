export interface BotSessionRepository {
  get(key: string): Promise<unknown | undefined>;
  set(key: string, data: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}
