"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";

interface ChartExpandModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Chart preview dialog: nearly fullscreen on desktop, sheet-style on mobile.
export function ChartExpandModal({
  open,
  title,
  description,
  onClose,
  children,
}: ChartExpandModalProps) {
  const reduceMotion = useReducedMotion();
  const copy = appContent.stats;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const backdropMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const panelMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 } }
    : {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
      };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-[4vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chart-expand-title"
          onClick={onClose}
          {...backdropMotion}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              "flex w-full flex-col overflow-hidden border border-border/80 bg-surface shadow-xl",
              "h-[min(92svh,720px)] rounded-t-2xl sm:h-[min(90vh,800px)] sm:max-w-3xl sm:rounded-2xl",
              "md:h-[90vh] md:max-w-[90vw]",
            )}
            onClick={(event) => event.stopPropagation()}
            {...panelMotion}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h2 id="chart-expand-title" className="text-base font-semibold text-primary sm:text-lg">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-0.5 text-xs text-muted sm:text-sm">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.closeExpandedChart}
                className={cn(
                  "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg",
                  "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
                )}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="min-h-0 flex-1 p-3 sm:p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
