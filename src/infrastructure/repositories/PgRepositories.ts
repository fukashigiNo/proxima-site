import "server-only";
import type { PresetBuild } from "@/domain/entities/Build";
import type { BuildRequest } from "@/domain/entities/BuildRequest";
import type { PcComponent } from "@/domain/entities/PcComponent";
import type { BuildRequestRepository } from "@/domain/repositories/BuildRequestRepository";
import type { ComponentRepository } from "@/domain/repositories/ComponentRepository";
import type { PresetRepository } from "@/domain/repositories/PresetRepository";
import { getPool } from "../persistence/postgres";

type Ready = () => Promise<void>;

async function query<T>(ready: Ready, sql: string, params: unknown[] = []) {
  await ready();
  return (await getPool().query<{ data: T }>(sql, params)).rows.map((r) => r.data);
}

export class PgComponentRepository implements ComponentRepository {
  constructor(private readonly ready: Ready) {}

  findAll() {
    return query<PcComponent>(this.ready, "SELECT data FROM components ORDER BY position");
  }

  findByIds(ids: readonly string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return query<PcComponent>(this.ready, "SELECT data FROM components WHERE id = ANY($1) ORDER BY position", [ids]);
  }

  async create(component: PcComponent) {
    await query(this.ready, "INSERT INTO components (id, data) VALUES ($1, $2)", [component.id, component]);
  }

  async update(component: PcComponent) {
    await query(this.ready, "UPDATE components SET data = $2 WHERE id = $1", [component.id, component]);
  }

  async delete(id: string) {
    await query(this.ready, "DELETE FROM components WHERE id = $1", [id]);
  }
}

export class PgPresetRepository implements PresetRepository {
  constructor(private readonly ready: Ready) {}

  findAll() {
    return query<PresetBuild>(this.ready, "SELECT data FROM presets ORDER BY position");
  }

  async findById(id: string) {
    return (await query<PresetBuild>(this.ready, "SELECT data FROM presets WHERE id = $1", [id]))[0] ?? null;
  }

  async save(preset: PresetBuild) {
    await query(
      this.ready,
      "INSERT INTO presets (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [preset.id, preset],
    );
  }

  async delete(id: string) {
    await query(this.ready, "DELETE FROM presets WHERE id = $1", [id]);
  }
}

export class PgBuildRequestRepository implements BuildRequestRepository {
  constructor(private readonly ready: Ready) {}

  findAll() {
    return query<BuildRequest>(this.ready, "SELECT data FROM requests ORDER BY created_at DESC");
  }

  async findById(id: string) {
    return (await query<BuildRequest>(this.ready, "SELECT data FROM requests WHERE id = $1", [id]))[0] ?? null;
  }

  async save(request: BuildRequest) {
    await query(
      this.ready,
      "INSERT INTO requests (id, data, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [request.id, request, request.createdAt],
    );
  }
}
