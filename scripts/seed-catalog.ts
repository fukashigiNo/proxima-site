import pg from "pg";
import { validateComponent } from "../src/domain/entities/ComponentRules";
import { COMPONENTS } from "../src/infrastructure/data/catalog";

try {
  process.loadEnvFile(".env.local");
} catch {}

const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!raw) {
  console.error("Нет DIRECT_URL или DATABASE_URL в .env.local");
  process.exit(1);
}

const url = new URL(raw);
const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
url.searchParams.delete("sslmode");
const client = new pg.Client({ connectionString: url.toString(), ssl: local ? undefined : { rejectUnauthorized: false } });

const invalid = COMPONENTS.filter((c) => Object.keys(validateComponent(c)).length > 0);
if (invalid.length) {
  console.error("Некорректные позиции:", invalid.map((c) => c.id).join(", "));
  process.exit(1);
}

const overwrite = process.argv.includes("--overwrite");
const imagesOnly = process.argv.includes("--images");

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("CREATE TABLE IF NOT EXISTS components (id text PRIMARY KEY, data jsonb NOT NULL, position bigserial)");
  let added = 0;
  if (imagesOnly) {
    for (const c of COMPONENTS) {
      if (!c.image) continue;
      const patch = { image: c.image, ...(c.imageCredit ? { imageCredit: c.imageCredit } : {}) };
      added += (await client.query("UPDATE components SET data = data || $2::jsonb WHERE id = $1 AND NOT (data ? 'image')", [c.id, patch])).rowCount ?? 0;
    }
    await client.query("COMMIT");
    console.log(`Фото добавлено: ${added} (${url.hostname})`);
    process.exit(0);
  }
  for (const c of COMPONENTS) {
    const sql = overwrite
      ? "INSERT INTO components (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data"
      : "INSERT INTO components (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING";
    added += (await client.query(sql, [c.id, c])).rowCount ?? 0;
  }
  await client.query("COMMIT");
  const total = (await client.query("SELECT count(*)::int AS n FROM components")).rows[0].n;
  console.log(`${overwrite ? "Записано" : "Добавлено новых"}: ${added}. Всего в базе: ${total} (${url.hostname})`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("Ошибка:", (error as Error).message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
