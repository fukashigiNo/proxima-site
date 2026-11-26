import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import type { PresetBuild } from "@/domain/entities/Build";
import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { PcComponent } from "@/domain/entities/PcComponent";

const globalForPg = globalThis as unknown as { proximaPool?: Pool; proximaSchema?: Promise<void> };

export const isPostgresEnabled = () => Boolean(process.env.DATABASE_URL);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", ""]);

export function connectionConfig(raw: string) {
  const url = new URL(raw);
  const local = LOCAL_HOSTS.has(url.hostname) || url.searchParams.get("sslmode") === "disable";
  url.searchParams.delete("sslmode");
  return {
    connectionString: url.toString(),
    ssl: local ? undefined : { rejectUnauthorized: false },
  };
}

export function getPool() {
  globalForPg.proximaPool ??= new Pool({
    ...connectionConfig(process.env.DATABASE_URL ?? ""),
    max: Number(process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL ? 1 : 5)),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return globalForPg.proximaPool;
}

async function readLegacyJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.env.DATA_DIR ?? path.join(process.cwd(), "data"), file), "utf8")) as T;
  } catch {
    return null;
  }
}

export function ensureSchema(seed: { components: () => PcComponent[]; presets: () => PresetBuild[] }) {
  globalForPg.proximaSchema ??= (async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(7316241)");
      await client.query(`
        CREATE TABLE IF NOT EXISTS components (
          id text PRIMARY KEY,
          data jsonb NOT NULL,
          position bigserial
        );
        CREATE TABLE IF NOT EXISTS presets (
          id text PRIMARY KEY,
          data jsonb NOT NULL,
          position bigserial
        );
        CREATE TABLE IF NOT EXISTS requests (
          id text PRIMARY KEY,
          data jsonb NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS requests_created_at_idx ON requests (created_at DESC);
        CREATE TABLE IF NOT EXISTS bot_sessions (
          key text PRIMARY KEY,
          data jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        );
        ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE components ENABLE ROW LEVEL SECURITY;
        ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
        ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
      `);

      const empty = async (table: string) => (await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rowCount === 0;

      if (await empty("components")) {
        const rows = (await readLegacyJson<PcComponent[]>("components.json")) ?? seed.components();
        for (const c of rows) await client.query("INSERT INTO components (id, data) VALUES ($1, $2)", [c.id, c]);
      }
      if (await empty("presets")) {
        const rows = (await readLegacyJson<PresetBuild[]>("presets.json")) ?? seed.presets();
        for (const p of rows) await client.query("INSERT INTO presets (id, data) VALUES ($1, $2)", [p.id, p]);
      }
      if (await empty("requests")) {
        const rows = (await readLegacyJson<BuildRequest[]>("requests.json")) ?? [];
        for (const r of rows)
          await client.query("INSERT INTO requests (id, data, created_at) VALUES ($1, $2, $3)", [r.id, r, r.createdAt]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      globalForPg.proximaSchema = undefined;
      throw error;
    } finally {
      client.release();
    }
  })();
  return globalForPg.proximaSchema;
}
