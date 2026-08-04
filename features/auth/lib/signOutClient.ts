"use client";

import { Capacitor, CapacitorCookies } from "@capacitor/core";
import { signOut } from "next-auth/react";

// Auth.js cookie names that may remain on the app host after signOut.
const AUTH_COOKIE_KEYS = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
];

// Signs out and clears only Camino auth cookies (keeps Google account cookies in the WebView).
export async function signOutClient(callbackUrl = "/login") {
  await signOut({ redirect: false, callbackUrl });

  if (Capacitor.isNativePlatform()) {
    try {
      const origin = window.location.origin;
      await CapacitorCookies.clearCookies({ url: origin });
      await Promise.all(
        AUTH_COOKIE_KEYS.map((key) =>
          CapacitorCookies.deleteCookie({ url: origin, key }).catch(() => undefined),
        ),
      );
    } catch {
      // Native cookie API unavailable — Auth.js Set-Cookie still ran above.
    }
  }

  window.location.assign(callbackUrl);
}
