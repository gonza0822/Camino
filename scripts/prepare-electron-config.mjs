import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

/** Writes electron/app-config.json from CAMINO_APP_URL, AUTH_URL, or .env.local. */
function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const envFile = loadEnvLocal();
const appUrl =
  process.env.CAMINO_APP_URL ||
  process.env.AUTH_URL ||
  envFile.CAMINO_APP_URL ||
  envFile.AUTH_URL ||
  "";

if (!appUrl || /localhost|127\.0\.0\.1/i.test(appUrl)) {
  console.error(
    "[electron] Refusing to package with a localhost URL.\n" +
      "Set CAMINO_APP_URL (or AUTH_URL) to your Vercel URL, e.g.:\n" +
      '  $env:CAMINO_APP_URL="https://tu-proyecto.vercel.app"; npm run electron:build',
  );
  process.exit(1);
}

const target = resolve(process.cwd(), "electron", "app-config.json");
writeFileSync(target, `${JSON.stringify({ appUrl }, null, 2)}\n`, "utf8");
console.log(`[electron] app-config.json → ${appUrl}`);
