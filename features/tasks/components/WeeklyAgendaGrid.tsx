"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  formatDayParts,
  getMonday,
  getTodayKey,
  getWeekDateKeys,
  toDateKey,
} from "@/lib/utils/date";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
import {
  consumeHardReloadReset,
  readWeeklyViewMemory,
  writeWeeklyViewMemory,
} from "@/features/planning/weeklyViewMemory";
import { useAppDispatch } from "@/store/hooks";
import { clearWeeklyView, setWeeklyView } from "@/store/slices/uiSlice";
import type { TaskDto } from "@/types/app";
import { cn } from "@/lib/utils/cn";

interface WeeklyAgendaGridProps {
  weekStart: string;
  dates: string[];
  tasks: TaskDto[];
  hours: number[];
}

// Prefers URL day, then today when it belongs to the week, then Monday.
function resolveActiveDate(dates: string[], dayParam: string | null): string {
  if (dayParam && dates.includes(dayParam)) return dayParam;
  const today = getTodayKey();
  if (dates.includes(today)) return today;
  return dates[0];
}

// Saves week/day to Redux + sessionStorage for soft section switches.
function persistWeeklyView(
  dispatch: ReturnType<typeof useAppDispatch>,
  weekStart: string,
  day: string,
) {
  const memory = { weekStart, day };
  writeWeeklyViewMemory(memory);
  dispatch(setWeeklyView(memory));
}

export function WeeklyAgendaGrid({
  weekStart,
  dates,
  tasks,
  hours,
}: WeeklyAgendaGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const bootstrappedRef = useRef(false);
  const dayParam = searchParams.get("day");
  const activeDate = resolveActiveDate(dates, dayParam);
  const tasksForDay = tasks.filter((t) => t.date === activeDate);

  // Soft nav keeps the chosen day; hard reload resets to today once per page load.
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    if (consumeHardReloadReset()) {
      dispatch(clearWeeklyView());
      const today = getTodayKey();
      const currentWeekStart = toDateKey(getMonday(new Date()));
      const currentDates = getWeekDateKeys(currentWeekStart);
      const day = currentDates.includes(today) ? today : currentDates[0];
      persistWeeklyView(dispatch, currentWeekStart, day);
      if (
        searchParams.get("week") !== currentWeekStart ||
        searchParams.get("day") !== day
      ) {
        router.replace(
          `/semanal?${new URLSearchParams({
            week: currentWeekStart,
            day,
          }).toString()}`,
        );
      }
      return;
    }

    const remembered = readWeeklyViewMemory();
    const urlWeek = searchParams.get("week");
    const urlDay = searchParams.get("day");

    if (!urlWeek && !urlDay && remembered) {
      persistWeeklyView(dispatch, remembered.weekStart, remembered.day);
      router.replace(
        `/semanal?${new URLSearchParams({
          week: remembered.weekStart,
          day: remembered.day,
        }).toString()}`,
      );
      return;
    }

    if (urlWeek && !urlDay) {
      const dayToKeep =
        remembered?.weekStart === weekStart && dates.includes(remembered.day)
          ? remembered.day
          : activeDate;
      persistWeeklyView(dispatch, weekStart, dayToKeep);
      const params = new URLSearchParams(searchParams.toString());
      params.set("week", weekStart);
      params.set("day", dayToKeep);
      router.replace(`/semanal?${params.toString()}`);
      return;
    }

    if (urlDay && dates.includes(urlDay)) {
      persistWeeklyView(dispatch, weekStart, urlDay);
    }
  }, [activeDate, dates, dispatch, router, searchParams, weekStart]);

  useEffect(() => {
    if (!dayParam || !dates.includes(dayParam)) return;
    persistWeeklyView(dispatch, weekStart, dayParam);
  }, [weekStart, dayParam, dates, dispatch]);

  function selectDay(date: string) {
    persistWeeklyView(dispatch, weekStart, date);
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", weekStart);
    params.set("day", date);
    router.push(`/semanal?${params.toString()}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid shrink-0 grid-cols-7 gap-1">
        {dates.map((date) => {
          const { weekday, day } = formatDayParts(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => selectDay(date)}
              aria-label={`${weekday} ${day}`}
              aria-pressed={activeDate === date}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center rounded-lg px-0.5 py-1.5 transition-colors duration-200 cursor-pointer",
                activeDate === date
                  ? "bg-cta text-white shadow-sm"
                  : "border border-border bg-surface/90 text-muted hover:border-cta/40 hover:text-primary",
              )}
            >
              <span className="text-[10px] font-medium capitalize leading-none sm:text-xs">
                {weekday}
              </span>
              <span className="mt-0.5 text-xs font-semibold leading-none sm:text-sm">
                {day}
              </span>
            </button>
          );
        })}
      </div>

      <HourlyAgenda date={activeDate} tasks={tasksForDay} hours={hours} />
    </div>
  );
}
