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
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => selectDay(date)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors duration-200 cursor-pointer",
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

// Helper for server pages to compute week dates.
export { getWeekDateKeys };
