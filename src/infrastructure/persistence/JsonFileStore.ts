import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Простое файловое хранилище JSON: атомарная запись (tmp + rename) и последовательная
 * очередь операций, чтобы параллельные запросы не перетирали друг друга.
 * Подходит для одного инстанса; для масштабирования замените репозитории на БД.
 */
export class JsonFileStore<T> {
  private queue: Promise<unknown> = Promise.resolve();
  /** Первичное заполнение выполняется один раз, даже если файл читают параллельно */
  private seeding: Promise<T> | null = null;

  constructor(
    private readonly filePath: string,
    private readonly seed: () => T,
  ) {}

  async read(): Promise<T> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.seeding ??= (async () => {
        const initial = this.seed();
        try {
          await this.write(initial);
        } catch (writeError) {
          // Файловая система только для чтения: отдаём исходные данные, чтобы сайт продолжал работать
          console.warn(`[JsonFileStore] не удалось сохранить ${this.filePath}:`, (writeError as Error).message);
        }
        return initial;
      })().finally(() => {
        this.seeding = null;
      });
      return this.seeding;
    }
  }

  /** Читает, изменяет и сохраняет данные в рамках одной операции очереди. */
  update(mutate: (data: T) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const next = mutate(await this.read());
      await this.write(next);
      return next;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async write(data: T) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await rename(tmp, this.filePath);
  }
}

/**
 * Каталог данных: DATA_DIR, иначе ./data. На Vercel папка проекта только для чтения,
 * поэтому там используется временный каталог — данные живут, пока жив инстанс функции.
 */
const dataDir = () => process.env.DATA_DIR ?? (process.env.VERCEL ? path.join(tmpdir(), "proxima-data") : path.join(process.cwd(), "data"));

export const dataPath = (file: string) => path.join(dataDir(), file);
