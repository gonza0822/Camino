"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { appContent } from "@/lib/content/app";
import { formatDisplayDateLong } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { DayDetailContent } from "@/features/calendar/components/DayDetailContent";
import type { CalendarDaySummary } from "@/features/calendar/types";

interface CalendarDayModalProps {
  open: boolean;
  date: string | null;
  summary: CalendarDaySummary | null;
  loading: boolean;
  onClose: () => void;
}

export function CalendarDayModal({
  open,
  date,
  summary,
  loading,
  onClose,
}: CalendarDayModalProps) {
  const reduceMotion = useReducedMotion();
  const copy = appContent.calendar;

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

  const titleDate = summary?.date ?? date;

  return (
    <AnimatePresence>
      {open && date ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-day-modal-title"
          aria-busy={loading}
          onClick={onClose}
          {...backdropMotion}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              "flex max-h-[min(90vh,720px)] w-full flex-col overflow-hidden",
              "rounded-t-2xl border border-border/80 bg-surface shadow-xl sm:max-w-lg sm:rounded-2xl",
            )}
            onClick={(event) => event.stopPropagation()}
            {...panelMotion}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="calendar-day-modal-title" className="text-base font-semibold text-primary">
                  {copy.dayDetailTitle}
                </h2>
                {titleDate ? (
                  <p className="mt-0.5 text-sm capitalize text-muted">
                    {formatDisplayDateLong(titleDate)}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.closeDayDetail}
                className={cn(
                  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg",
                  "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
                )}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading || !summary ? (
                <div className="space-y-3 p-4 sm:p-5" aria-live="polite">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-lg bg-primary/10" />
                    ))}
                  </div>
                  <div className="h-24 animate-pulse rounded-lg bg-primary/10" />
                </div>
              ) : (
                <DayDetailContent summary={summary} />
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
