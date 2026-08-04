"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { appContent } from "@/lib/content/app";
import { useAutosavedDailyNote } from "@/features/notes/hooks/useAutosavedDailyNote";
import { cn } from "@/lib/utils/cn";

interface TodayNotesMobileProps {
  date: string;
  initialContent: string;
}

// Mobile: header book button + modal for writing the daily note.
export function TodayNotesMobile({ date, initialContent }: TodayNotesMobileProps) {
  const copy = appContent.dashboard.notes;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { content, handleChange, flushSave } = useAutosavedDailyNote(date, initialContent);
  const hasNote = content.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleClose = () => {
    flushSave();
    setOpen(false);
  };

  const backdropMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const panelMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 16 },
      };

  return (
    <div className="contents lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.openModal}
        className={cn(
          "relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full",
          "bg-primary/10 text-primary",
          "transition-colors duration-200 hover:bg-primary/15",
        )}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        {hasNote ? (
          <span
            className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-surface bg-cta"
            aria-hidden
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="today-notes-mobile-title"
            onClick={handleClose}
            {...backdropMotion}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={cn(
                "flex max-h-[min(92svh,720px)] w-full flex-col overflow-hidden",
                "rounded-t-2xl border border-border/80 bg-surface shadow-xl sm:max-w-lg sm:rounded-2xl",
              )}
              onClick={(event) => event.stopPropagation()}
              {...panelMotion}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
                <h2 id="today-notes-mobile-title" className="text-base font-semibold text-primary">
                  {copy.title}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={copy.closePanel}
                  className={cn(
                    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg",
                    "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </header>

              <div className="min-h-0 flex-1 p-3 sm:p-4">
                <textarea
                  value={content}
                  onChange={(event) => handleChange(event.target.value)}
                  onBlur={flushSave}
                  placeholder={copy.placeholder}
                  maxLength={10000}
                  autoFocus
                  className={cn(
                    "h-full min-h-[14rem] w-full resize-none rounded-xl border border-border/70",
                    "bg-background/60 px-3 py-3 text-base text-foreground outline-none",
                    "placeholder:text-muted/70 focus-visible:ring-2 focus-visible:ring-primary/25",
                  )}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
