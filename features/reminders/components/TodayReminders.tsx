"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  createReminderAction,
  deleteReminderAction,
  updateReminderAction,
} from "@/app/actions/reminders";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";
import type { ReminderDto } from "@/types/app";

interface TodayRemindersProps {
  initialReminders: ReminderDto[];
}

// Floating reminders panel on the today dashboard (bottom-right, clear of help chat).
export function TodayReminders({ initialReminders }: TodayRemindersProps) {
  const copy = appContent.dashboard.reminders;
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState(initialReminders);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const pendingCount = reminders.filter((item) => !item.completed).length;

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await createReminderAction({ title });
      if (result.error || !result.reminder) return;
      setReminders((prev) => [...prev, result.reminder]);
      setDraft("");
    });
  }

  function toggleComplete(reminder: ReminderDto) {
    const nextCompleted = !reminder.completed;
    setReminders((prev) =>
      prev.map((item) =>
        item.id === reminder.id ? { ...item, completed: nextCompleted } : item,
      ),
    );

    startTransition(async () => {
      const result = await updateReminderAction(reminder.id, {
        completed: nextCompleted,
      });
      if (result.error) {
        setReminders((prev) =>
          prev.map((item) =>
            item.id === reminder.id
              ? { ...item, completed: reminder.completed }
              : item,
          ),
        );
      }
    });
  }

  function handleDelete(id: string) {
    const previous = reminders;
    setReminders((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      const result = await deleteReminderAction(id);
      if (result.error) setReminders(previous);
    });
  }

  const panelMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.98 },
      };

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2 sm:bottom-24 sm:right-6 lg:bottom-6 lg:right-24">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="reminders-panel"
            role="dialog"
            aria-label={copy.title}
            className={cn(
              "pointer-events-auto flex w-[min(100vw-2rem,20rem)] flex-col overflow-hidden",
              "rounded-2xl border border-border/80 bg-surface/95 shadow-xl backdrop-blur-md",
            )}
            {...panelMotion}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
              <h2 className="text-sm font-semibold text-primary">{copy.title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className={cn(
                  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg",
                  "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleCreate} className="flex gap-2 border-b border-border/60 p-3">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={copy.placeholder}
                maxLength={200}
                className={cn(
                  "min-w-0 flex-1 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground outline-none",
                  "placeholder:text-muted/70 focus-visible:ring-2 focus-visible:ring-primary/25",
                )}
              />
              <button
                type="submit"
                disabled={isPending || !draft.trim()}
                className={cn(
                  "shrink-0 cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white",
                  "transition-colors duration-200 hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {copy.add}
              </button>
            </form>

            <ul className="max-h-64 space-y-1 overflow-y-auto p-2">
              {reminders.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-muted">{copy.empty}</li>
              ) : (
                reminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-2 py-2 transition-colors duration-200",
                      reminder.completed ? "bg-success/5" : "hover:bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleComplete(reminder)}
                      role="checkbox"
                      aria-checked={reminder.completed}
                      aria-label={
                        reminder.completed ? copy.markIncomplete : copy.markComplete
                      }
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border-2",
                        "transition-colors duration-200",
                        reminder.completed
                          ? "border-success bg-success text-white"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {reminder.completed ? (
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : null}
                    </button>

                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm text-foreground",
                        reminder.completed && "text-muted line-through",
                      )}
                    >
                      {reminder.title}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(reminder.id)}
                      aria-label={copy.delete}
                      className={cn(
                        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
                        "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? copy.close : copy.open}
        className={cn(
          "pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full",
          "border border-border/80 bg-surface/95 px-3.5 py-2.5 text-sm font-medium text-primary shadow-lg",
          "backdrop-blur-md transition-colors duration-200 hover:bg-primary/10",
        )}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span>{copy.title}</span>
        {pendingCount > 0 ? (
          <span className="rounded-full bg-cta px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
            {pendingCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}
