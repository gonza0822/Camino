"use client";

import { useEffect, useState } from "react";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";

declare global {
  interface Window {
    caminoDesktop?: {
      isDesktop: boolean;
      platform: string;
    };
  }
}

function resolveDownloadUrl(): string {
  return (
    process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL?.trim() ||
    "/downloads/Camino-Setup.exe"
  );
}

// Sidebar CTA to download the Electron desktop installer (hidden inside the desktop shell).
export function DesktopDownloadButton({ onNavigate }: { onNavigate?: () => void }) {
  const copy = appContent.desktop;
  const [isDesktopShell, setIsDesktopShell] = useState(false);

  useEffect(() => {
    setIsDesktopShell(Boolean(window.caminoDesktop?.isDesktop));
  }, []);

  if (isDesktopShell) return null;

  return (
    <a
      href={resolveDownloadUrl()}
      download
      onClick={onNavigate}
      aria-label={copy.downloadAria}
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
      <span>{copy.downloadButton}</span>
    </a>
  );
}
