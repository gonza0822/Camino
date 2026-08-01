import type { CapacitorConfig } from "@capacitor/cli";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/** Reads production URL baked by scripts/prepare-capacitor-config.mjs */
function readAppUrl(): string | undefined {
  const configPath = resolve(process.cwd(), "capacitor", "app-config.json");
  if (!existsSync(configPath)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf8")) as { appUrl?: string };
    const url = parsed.appUrl?.trim();
    return url || undefined;
  } catch {
    return undefined;
  }
}

const appUrl = process.env.CAMINO_APP_URL?.trim() || readAppUrl();

const config: CapacitorConfig = {
  appId: "com.camino.app",
  appName: "Camino",
  webDir: "capacitor/www",
  server: appUrl
    ? {
        url: appUrl,
        cleartext: appUrl.startsWith("http://"),
      }
    : undefined,
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
