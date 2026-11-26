import pg from "pg";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", ""]);

function config(raw) {
  const url = new URL(raw);
  const local = LOCAL_HOSTS.has(url.hostname) || url.searchParams.get("sslmode") === "disable";
  url.searchParams.delete("sslmode");
  return { connectionString: url.toString(), ssl: local ? undefined : { rejectUnauthorized: false } };
}

const source = process.env.SOURCE_URL || `postgresql://${process.env.USER}@localhost:5432/proxima`;
const target = process.env.DIRECT_URL;
const dryRun = process.argv.includes("--dry-run");

if (!target) {
  console.error("Нет DIRECT_URL. Добавьте в .env.local строку Session pooler (порт 5432) из Supabase → Connect.");
  process.exit(1);
}
const where = (u) => { const x = new URL(u); return `${x.host}${x.pathname}`; };
if (where(source) === where(target)) {
  console.error("Источник и цель совпадают — нечего переносить.");
  process.exit(1);
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS components (id text PRIMARY KEY, data jsonb NOT NULL, position bigserial);
  CREATE TABLE IF NOT EXISTS presets (id text PRIMARY KEY, data jsonb NOT NULL, position bigserial);
  CREATE TABLE IF NOT EXISTS requests (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
  CREATE INDEX IF NOT EXISTS requests_created_at_idx ON requests (created_at DESC);
  ALTER TABLE components ENABLE ROW LEVEL SECURITY;
  ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
  CREATE TABLE IF NOT EXISTS bot_sessions (key text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
  ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;
`;

const from = new pg.Client(config(source));
const to = new pg.Client(config(target));

try {
  await from.connect();
  await to.connect();

  const components = (await from.query("SELECT id, data FROM components ORDER BY position")).rows;
  const presets = (await from.query("SELECT id, data FROM presets ORDER BY position")).rows;
  const requests = (await from.query("SELECT id, data, created_at FROM requests ORDER BY created_at")).rows;
  console.log(`Источник: ${components.length} комплектующих, ${presets.length} сборок, ${requests.length} заявок`);

  if (dryRun) {
    await to.query("SELECT 1");
    console.log("Подключение к Supabase работает. Пробный прогон — ничего не записано.");
    process.exit(0);
  }

  await to.query("BEGIN");
  await to.query(SCHEMA);
  for (const r of components)
    await to.query("INSERT INTO components (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data", [r.id, r.data]);
  for (const r of presets)
    await to.query("INSERT INTO presets (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data", [r.id, r.data]);
  for (const r of requests)
    await to.query(
      "INSERT INTO requests (id, data, created_at) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data",
      [r.id, r.data, r.created_at],
    );
  await to.query("COMMIT");

  const count = async (t) => (await to.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
  console.log(`Supabase: ${await count("components")} комплектующих, ${await count("presets")} сборок, ${await count("requests")} заявок`);
  console.log("Готово.");
} catch (error) {
  await to.query("ROLLBACK").catch(() => undefined);
  console.error("Ошибка переноса:", error.message);
  process.exitCode = 1;
} finally {
  await from.end().catch(() => undefined);
  await to.end().catch(() => undefined);
}
