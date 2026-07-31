"use client";

import { appContent } from "@/lib/content/app";
import {
  getMonthCalendarGrid,
  getMonthName,
  parseDateKey,
  WEEKDAY_LABELS_SHORT,
} from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { CalendarDayMarkerMap } from "@/features/calendar/types";

const WEEK_ROWS = 6;
const CELLS_PER_MONTH = WEEK_ROWS * 7;

interface MonthMiniGridProps {
  year: number;
  month: number;
  selectedDate: string;
  todayKey: string;
  markers: CalendarDayMarkerMap;
  onSelectDate: (dateKey: string) => void;
}

function padMonthCells(weeks: (string | null)[][]): (string | null)[] {
  const flat = weeks.flat();
  while (flat.length < CELLS_PER_MONTH) flat.push(null);
  return flat.slice(0, CELLS_PER_MONTH);
}

export function MonthMiniGrid({
  year,
  month,
  selectedDate,
  todayKey,
  markers,
  onSelectDate,
}: MonthMiniGridProps) {
  const weeks = getMonthCalendarGrid(year, month);
  const cells = padMonthCells(weeks);
  const monthLabel = getMonthName(month);

  return (
    <article
      className={cn(
        "rounded-xl border border-border/80 bg-surface/90 p-3 shadow-sm backdrop-blur-sm",
        "transition-shadow duration-200 hover:shadow-md",
      )}
      aria-label={monthLabel}
    >
      <h2 className="mb-2 text-center text-xs font-semibold capitalize text-primary sm:text-sm">
        {monthLabel}
      </h2>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_LABELS_SHORT.map((label) => (
          <span
            key={label}
            className="py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted"
          >
            {label.slice(0, 1)}
          </span>
        ))}
        {cells.map((dateKey, index) => {
          if (!dateKey) {
            return <span key={`pad-${index}`} className="aspect-square" aria-hidden />;
          }

          const day = parseDateKey(dateKey).getDate();
          const marker = markers[dateKey];
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === todayKey;
          const allDone =
            marker && marker.taskCount > 0 && marker.completedCount === marker.taskCount;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              aria-label={dateKey}
              aria-pressed={isSelected}
              className={cn(
                "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md",
                "text-[0.7rem] tabular-nums transition-colors duration-200 sm:text-xs",
                isSelected
                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/30"
                  : "text-foreground hover:bg-primary/10",
                isToday && !isSelected && "font-semibold text-primary ring-1 ring-primary/40",
              )}
            >
              {day}
              <span className="mt-0.5 flex h-1 items-center justify-center gap-0.5">
                {marker && marker.taskCount > 0 ? (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      isSelected ? "bg-white/90" : allDone ? "bg-success" : "bg-primary",
                    )}
                    aria-hidden
                  />
                ) : null}
                {marker?.hasNote ? (
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      isSelected ? "bg-white/70" : "bg-cta",
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function CalendarLegend() {
  const copy = appContent.calendar;
  return (
    <ul className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
      <li className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
        {copy.legendTasks}
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-cta" aria-hidden />
        {copy.legendNote}
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-4 w-4 rounded-md ring-1 ring-primary/40" aria-hidden />
        {copy.legendToday}
      </li>
    </ul>
  );
}
