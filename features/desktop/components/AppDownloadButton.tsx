"use client";

import { useEffect, useState } from "react";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";

type ClientPlatform = "android" | "ios" | "desktop";

declare global {
  interface Window {
    caminoDesktop?: {
      isDesktop: boolean;
      platform: string;
    };
    Capacitor?: {
      isNativePlatform?: () => boolean;
    };
  }
}

function detectPlatform(): ClientPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  // iPadOS 13+ may report as Mac — treat touch Macs carefully; default desktop.
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return "ios";
  return "desktop";
}

function resolveDownload(platform: ClientPlatform): {
  url: string | null;
  label: string;
  aria: string;
  unavailable: string;
} {
  const copy = appContent.desktop;
  if (platform === "android") {
    return {
      url: process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL?.trim() || null,
      label: copy.downloadButtonAndroid,
      aria: copy.downloadAriaAndroid,
      unavailable: copy.downloadUnavailableAndroid,
    };
  }
  if (platform === "ios") {
    return {
      url: process.env.NEXT_PUBLIC_IOS_DOWNLOAD_URL?.trim() || null,
      label: copy.downloadButtonIos,
      aria: copy.downloadAriaIos,
      unavailable: copy.downloadUnavailableIos,
    };
  }
  return {
    url: process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL?.trim() || null,
    label: copy.downloadButton,
    aria: copy.downloadAria,
    unavailable: copy.downloadUnavailable,
  };
}

// Sidebar CTA: desktop → Electron installer; mobile → Android/iOS store or APK.
export function AppDownloadButton({ onNavigate }: { onNavigate?: () => void }) {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [platform, setPlatform] = useState<ClientPlatform>("desktop");

  useEffect(() => {
    const inElectron = Boolean(window.caminoDesktop?.isDesktop);
    const inCapacitor = Boolean(window.Capacitor?.isNativePlatform?.());
    setHidden(inElectron || inCapacitor);
    setPlatform(detectPlatform());
    setReady(true);
  }, []);

  if (!ready || hidden) return null;

  const { url, label, aria, unavailable } = resolveDownload(platform);

  if (!url) {
    return (
      <p className="px-1 text-center text-[11px] leading-snug text-muted" role="status">
        {unavailable}
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      aria-label={aria}
      className={cn(
        "flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2.5",
        "bg-cta text-sm font-semibold text-white shadow-sm",
        "transition-colors duration-200 hover:bg-cta-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
      )}
    >
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      <span>{label}</span>
    </a>
  );
}

/** @deprecated Use AppDownloadButton */
export const DesktopDownloadButton = AppDownloadButton;
