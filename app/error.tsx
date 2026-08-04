"use client";

import { useEffect } from "react";
import { appContent } from "@/lib/content/app";

// Catches route render errors so users can recover without the opaque Vercel 500 page.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[50svh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        {appContent.runtimeError.title}
      </h1>
      <p className="max-w-md text-sm text-muted">
        {appContent.runtimeError.description}
      </p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary/90"
      >
        {appContent.runtimeError.reload}
      </button>
    </main>
  );
}
