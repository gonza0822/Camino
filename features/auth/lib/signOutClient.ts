"use client";

import { Capacitor, CapacitorCookies } from "@capacitor/core";
import { signOut } from "next-auth/react";

// Signs out and hard-clears WebView cookies so Android does not restore a stale session.
export async function signOutClient(callbackUrl = "/login") {
  await signOut({ redirect: false, callbackUrl });

  if (Capacitor.isNativePlatform()) {
    try {
      const origin = window.location.origin;
      await CapacitorCookies.clearCookies({ url: origin });
      await CapacitorCookies.clearAllCookies();
    } catch {
      // Native cookie API unavailable — Auth.js Set-Cookie still ran above.
    }
  }

  window.location.assign(callbackUrl);
}
