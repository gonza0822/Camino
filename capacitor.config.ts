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

let appHost: string | undefined;
try {
  if (appUrl) appHost = new URL(appUrl).hostname;
} catch {
  appHost = undefined;
}

// Chrome-like UA without "; wv)" so Google OAuth is not blocked in the Capacitor WebView.
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";

const config: CapacitorConfig = {
  appId: "com.camino.app",
  appName: "Camino",
  webDir: "capacitor/www",
  server: appUrl
    ? {
        url: appUrl,
        cleartext: appUrl.startsWith("http://"),
        allowNavigation: [
          ...(appHost ? [appHost, `*.${appHost}`] : []),
          "*.google.com",
          "accounts.google.com",
          "*.googleusercontent.com",
          "*.gstatic.com",
          "*.googleapis.com",
        ],
      }
    : undefined,
  android: {
    allowMixedContent: false,
    // Google rejects OAuth inside WebViews that advertise "; wv)" in the user agent.
    overrideUserAgent: ANDROID_CHROME_UA,
  },
  ios: {
    contentInset: "automatic",
    // WKWebView also needs a non-WebView UA for Google OAuth.
    overrideUserAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
