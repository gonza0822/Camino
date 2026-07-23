"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatShortDay, getWeekDateKeys } from "@/lib/utils/date";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
import type { TaskDto } from "@/types/app";
import { cn } from "@/lib/utils/cn";

interface WeeklyAgendaGridProps {
  weekStart: string;
  dates: string[];
  tasks: TaskDto[];
  hours: number[];
}

export function WeeklyAgendaGrid({
  weekStart,
  dates,
  tasks,
  hours,
}: WeeklyAgendaGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeDate = searchParams.get("day") ?? dates[0];

  const tasksForDay = tasks.filter((t) => t.date === activeDate);

  function selectDay(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", weekStart);
    params.set("day", date);
    router.push(`/semanal?${params.toString()}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 gap-2 overflow-x-auto pb-0.5">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => selectDay(date)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-colors duration-200 cursor-pointer sm:text-sm",
              activeDate === date
                ? "bg-cta text-white shadow-sm"
                : "border border-border bg-surface/90 text-muted hover:border-cta/40 hover:text-primary",
            )}
          >
            {formatShortDay(date)}
          </button>
        ))}
      </div>

      <HourlyAgenda date={activeDate} tasks={tasksForDay} hours={hours} />
    </div>
  );
}

export { getWeekDateKeys };
