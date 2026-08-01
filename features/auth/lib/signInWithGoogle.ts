"use client";

import { signIn } from "next-auth/react";

/** Starts Google OAuth with a full redirect (needed for Capacitor WebView cookie/OAuth cycle). */
export async function signInWithGoogle(callbackUrl = "/") {
  await signIn("google", { callbackUrl, redirect: true });
}
