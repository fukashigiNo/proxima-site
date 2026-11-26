import path from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";

const root = process.cwd();
try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {}

const jiti = createJiti(pathToFileURL(path.join(root, "scripts/")).href, {
  alias: {
    "@": path.join(root, "src"),
    "server-only": path.join(root, "scripts/empty.mjs"),
  },
});

const [entry, ...args] = process.argv.slice(2);
if (!entry) {
  console.error("Использование: node scripts/run-ts.mjs <файл.ts> [аргументы]");
  process.exit(1);
}
process.argv = [process.argv[0], entry, ...args];
await jiti.import(path.resolve(root, entry));
