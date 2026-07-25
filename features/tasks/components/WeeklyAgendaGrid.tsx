"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatDayParts, getTodayKey, getWeekDateKeys } from "@/lib/utils/date";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
import type { TaskDto } from "@/types/app";
import { cn } from "@/lib/utils/cn";

interface WeeklyAgendaGridProps {
  weekStart: string;
  dates: string[];
  tasks: TaskDto[];
  hours: number[];
}

// Picks the URL day if valid, otherwise today when it belongs to the week.
function resolveActiveDate(dates: string[], dayParam: string | null): string {
  if (dayParam && dates.includes(dayParam)) return dayParam;
  const today = getTodayKey();
  if (dates.includes(today)) return today;
  return dates[0];
}

export function WeeklyAgendaGrid({
  weekStart,
  dates,
  tasks,
  hours,
}: WeeklyAgendaGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeDate = resolveActiveDate(dates, searchParams.get("day"));

  const tasksForDay = tasks.filter((t) => t.date === activeDate);

  function selectDay(date: string) {
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

export { getWeekDateKeys };
