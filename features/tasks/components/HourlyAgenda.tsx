"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { appContent } from "@/lib/content/app";
import { formatHourLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { TaskDto } from "@/types/app";
import { saveTaskSlotAction, setTaskCompletedAction } from "@/app/actions/tasks";

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
  /** Shrinks row min-height and scroll padding (no layout padding — avoids a gap under the last hour). */
  bottomInsetPx?: number;
}

const SAVE_DEBOUNCE_MS = 1000;

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

export function HourlyAgenda({
  date,
  tasks,
  hours,
  className,
  bottomInsetPx = 0,
}: HourlyAgendaProps) {
  const [slots, setSlots] = useState(() => slotsFromTasks(tasks, hours));
  const dirtyRef = useRef<Set<number>>(new Set());
  const pendingCompleteRef = useRef<Set<number>>(new Set());
  const focusedHourRef = useRef<number | null>(null);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const saveSeqRef = useRef<Map<number, number>>(new Map());
  const latestRef = useRef(slots);
  const hoursKey = hours.join(",");
  const [, startTransition] = useTransition();

  latestRef.current = slots;

  // True while the user is editing a slot — never overwrite that title from props.
  function isLocked(hour: number): boolean {
    return (
      dirtyRef.current.has(hour) ||
      pendingCompleteRef.current.has(hour) ||
      focusedHourRef.current === hour ||
      timersRef.current.has(hour)
    );
  }

  // Reset local state only when the calendar day changes.
  useEffect(() => {
    dirtyRef.current.clear();
    pendingCompleteRef.current.clear();
    focusedHourRef.current = null;
    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
    saveSeqRef.current.clear();
    setSlots(slotsFromTasks(tasks, hours));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only remount agenda when day changes
  }, [date]);

  // Merge server tasks into unlocked slots only (ids/completion), never mid-edit titles.
  useEffect(() => {
    setSlots((prev) => {
      const byHour = new Map(tasks.map((t) => [t.hour, t]));
      let changed = false;
      const next = { ...prev };

      for (const hour of hours) {
        if (isLocked(hour)) continue;
        const task = byHour.get(hour);
        const incoming: SlotState = {
          id: task?.id,
          title: task?.title ?? "",
          completed: task?.completed ?? false,
        };
        const current = prev[hour];
        if (
          current?.id === incoming.id &&
          current?.title === incoming.title &&
          current?.completed === incoming.completed
        ) {
          continue;
        }
        next[hour] = incoming;
        changed = true;
      }

      return changed ? next : prev;
    });
    // hoursKey avoids resetting when parent passes a new hours[] reference each render
  }, [tasks, hoursKey]);

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
      const seq = (saveSeqRef.current.get(hour) ?? 0) + 1;
      saveSeqRef.current.set(hour, seq);

      startTransition(async () => {
        const result = await saveTaskSlotAction({
          date,
          hour,
          title: titleAtSave,
        });

        // Ignore stale responses from earlier keystrokes.
        if (saveSeqRef.current.get(hour) !== seq) return;
        if (result.error) return;

        const stillTyping =
          focusedHourRef.current === hour ||
          (latestRef.current[hour]?.title ?? "") !== titleAtSave ||
          timersRef.current.has(hour);

        if (!stillTyping) {
          dirtyRef.current.delete(hour);
        }

        setSlots((prev) => {
          const localTitle = prev[hour]?.title ?? "";
          if (!result.task) {
            if (localTitle.trim()) return prev;
            return {
              ...prev,
              [hour]: { title: "", completed: false },
            };
          }

          return {
            ...prev,
            [hour]: {
              id: result.task.id,
              // Always keep what the user currently sees.
              title: localTitle,
              completed: pendingCompleteRef.current.has(hour)
                ? (prev[hour]?.completed ?? result.task.completed)
                : result.task.completed,
            },
          };
        });
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

  function handleFocus(hour: number) {
    focusedHourRef.current = hour;
  }

  function handleBlur(hour: number) {
    if (focusedHourRef.current === hour) {
      focusedHourRef.current = null;
    }
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
    const slot = latestRef.current[hour];
    if (!slot?.title.trim()) return;

    const nextCompleted = !slot.completed;
    pendingCompleteRef.current.add(hour);
    dirtyRef.current.add(hour);
    setSlots((prev) => ({
      ...prev,
      [hour]: { ...prev[hour], completed: nextCompleted },
    }));

    startTransition(async () => {
      try {
        let taskId = latestRef.current[hour]?.id;
        if (!taskId) {
          const saved = await saveTaskSlotAction({
            date,
            hour,
            title: slot.title,
          });
          if (saved.error || !saved.task) {
            setSlots((prev) => ({
              ...prev,
              [hour]: { ...prev[hour], completed: slot.completed },
            }));
            return;
          }
          const savedTask = saved.task;
          taskId = savedTask.id;
          setSlots((prev) => ({
            ...prev,
            [hour]: {
              id: savedTask.id,
              title: prev[hour]?.title ?? savedTask.title,
              completed: nextCompleted,
            },
          }));
        }

        const result = await setTaskCompletedAction({
          date,
          hour,
          completed: nextCompleted,
        });
        if (result.error || !result.task) {
          setSlots((prev) => ({
            ...prev,
            [hour]: { ...prev[hour], completed: slot.completed },
          }));
          return;
        }

        dirtyRef.current.delete(hour);
        setSlots((prev) => ({
          ...prev,
          [hour]: {
            id: result.task.id,
            title: prev[hour]?.title ?? result.task.title,
            completed: result.task.completed,
          },
        }));
      } finally {
        pendingCompleteRef.current.delete(hour);
      }
    });
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border border-border/80 bg-surface/90 shadow-sm backdrop-blur-sm lg:overflow-hidden",
        className,
      )}
      style={
        {
          ["--agenda-row-min" as string]: `calc((100svh - 7.5rem - ${bottomInsetPx}px) / ${hours.length})`,
          scrollPaddingBottom: bottomInsetPx > 0 ? bottomInsetPx : undefined,
        } as React.CSSProperties
      }
    >
      {hours.map((hour) => {
        const slot = slots[hour] ?? { title: "", completed: false };
        const showCheckbox = Boolean(slot.title.trim() || slot.id);

        return (
          <div
            key={`${date}-${hour}`}
            className="flex min-h-[var(--agenda-row-min)] shrink-0 items-center gap-2 border-b border-border/60 px-3 last:border-b-0 sm:gap-3 lg:min-h-0 lg:flex-1 lg:shrink"
          >
            <div className="w-12 shrink-0 font-mono text-xs tabular-nums text-muted">
              {formatHourLabel(hour)}
            </div>

            {/* Stable slot so the input never remounts when the checkbox appears. */}
            <div className="flex h-4 w-4 shrink-0 items-center justify-center">
              {showCheckbox ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleComplete(hour)}
                  aria-checked={slot.completed}
                  role="checkbox"
                  aria-label={
                    slot.completed
                      ? appContent.dashboard.markIncomplete
                      : appContent.dashboard.markComplete
                  }
                  className={cn(
                    "flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-2 transition-colors duration-200",
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
              ) : null}
            </div>

            <input
              type="text"
              value={slot.title}
              onChange={(e) => handleTitleChange(hour, e.target.value)}
              onFocus={() => handleFocus(hour)}
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
