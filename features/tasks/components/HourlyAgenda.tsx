"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { appContent } from "@/lib/content/app";
import { formatHourLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { TaskDto } from "@/types/app";
import { saveTaskSlotAction, updateTaskAction } from "@/app/actions/tasks";

interface SlotState {
  id?: string;
  title: string;
  completed: boolean;
}

interface HourlyAgendaProps {
  date: string;
  tasks: TaskDto[];
  hours: number[];
  className?: string;
}

const SAVE_DEBOUNCE_MS = 700;

function slotsFromTasks(tasks: TaskDto[], hours: number[]): Record<number, SlotState> {
  const byHour = new Map(tasks.map((t) => [t.hour, t]));
  return Object.fromEntries(
    hours.map((hour) => {
      const task = byHour.get(hour);
      return [
        hour,
        {
          id: task?.id,
          title: task?.title ?? "",
          completed: task?.completed ?? false,
        } satisfies SlotState,
      ];
    }),
  );
}

export function HourlyAgenda({ date, tasks, hours, className }: HourlyAgendaProps) {
  const [slots, setSlots] = useState(() => slotsFromTasks(tasks, hours));
  const dirtyRef = useRef<Set<number>>(new Set());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const latestRef = useRef(slots);
  const [, startTransition] = useTransition();

  latestRef.current = slots;

  useEffect(() => {
    dirtyRef.current.clear();
    setSlots(slotsFromTasks(tasks, hours));
  }, [date, hours]);

  useEffect(() => {
    setSlots((prev) => {
      const next = { ...prev };
      const byHour = new Map(tasks.map((t) => [t.hour, t]));
      for (const hour of hours) {
        if (dirtyRef.current.has(hour)) continue;
        const task = byHour.get(hour);
        next[hour] = {
          id: task?.id,
          title: task?.title ?? "",
          completed: task?.completed ?? false,
        };
      }
      return next;
    });
  }, [tasks, hours]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, []);

  // Persists one hour slot; empty title clears the task.
  const persistSlot = useCallback(
    (hour: number) => {
      const titleAtSave = latestRef.current[hour]?.title ?? "";

      startTransition(async () => {
        const result = await saveTaskSlotAction({
          date,
          hour,
          title: titleAtSave,
        });

        if (result.error) return;

        // Skip applying if the user typed again while this save was in flight.
        if ((latestRef.current[hour]?.title ?? "") !== titleAtSave) return;

        dirtyRef.current.delete(hour);
        setSlots((prev) => ({
          ...prev,
          [hour]: {
            id: result.task?.id,
            title: result.task?.title ?? "",
            completed: result.task?.completed ?? false,
          },
        }));
      });
    },
    [date],
  );

  function scheduleSave(hour: number) {
    const existing = timersRef.current.get(hour);
    if (existing) clearTimeout(existing);

    timersRef.current.set(
      hour,
      setTimeout(() => {
        timersRef.current.delete(hour);
        persistSlot(hour);
      }, SAVE_DEBOUNCE_MS),
    );
  }

  function handleTitleChange(hour: number, title: string) {
    dirtyRef.current.add(hour);
    setSlots((prev) => ({
      ...prev,
      [hour]: { ...prev[hour], title },
    }));
    scheduleSave(hour);
  }

  function handleBlur(hour: number) {
    const timer = timersRef.current.get(hour);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(hour);
    }
    if (dirtyRef.current.has(hour)) {
      persistSlot(hour);
    }
  }

  function toggleComplete(hour: number) {
    const slot = slots[hour];
    if (!slot?.id) return;

    const nextCompleted = !slot.completed;
    setSlots((prev) => ({
      ...prev,
      [hour]: { ...prev[hour], completed: nextCompleted },
    }));

    startTransition(async () => {
      const result = await updateTaskAction(slot.id!, { completed: nextCompleted });
      if (result.error || !result.task) {
        setSlots((prev) => ({
          ...prev,
          [hour]: { ...prev[hour], completed: slot.completed },
        }));
      }
    });
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-surface/90 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {hours.map((hour) => {
        const slot = slots[hour] ?? { title: "", completed: false };

        return (
          <div
            key={hour}
            className="flex min-h-0 flex-1 items-center gap-2 border-b border-border/60 px-2 last:border-b-0 sm:gap-3 sm:px-3"
          >
            <div className="w-11 shrink-0 font-mono text-[11px] tabular-nums text-muted sm:w-12 sm:text-xs">
              {formatHourLabel(hour)}
            </div>

            {(slot.title.trim() || slot.id) && (
              <button
                type="button"
                onClick={() => toggleComplete(hour)}
                disabled={!slot.id}
                aria-checked={slot.completed}
                role="checkbox"
                aria-label={
                  slot.completed
                    ? appContent.dashboard.markIncomplete
                    : appContent.dashboard.markComplete
                }
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                  slot.id ? "cursor-pointer" : "cursor-default opacity-40",
                  slot.completed
                    ? "border-success bg-success text-white"
                    : "border-border hover:border-primary",
                )}
              >
                {slot.completed && (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )}
            {!slot.title.trim() && !slot.id && (
              <span className="h-4 w-4 shrink-0" aria-hidden />
            )}

            <input
              type="text"
              value={slot.title}
              onChange={(e) => handleTitleChange(hour, e.target.value)}
              onBlur={() => handleBlur(hour)}
              placeholder={appContent.dashboard.emptySlot}
              maxLength={200}
              aria-label={`${formatHourLabel(hour)} — ${appContent.dashboard.taskTitle}`}
              className={cn(
                "h-full min-h-0 w-full min-w-0 bg-transparent text-xs text-foreground outline-none sm:text-sm",
                "placeholder:text-muted/70",
                "focus-visible:rounded-md focus-visible:ring-1 focus-visible:ring-primary/30",
                slot.completed && "text-muted line-through",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
