"use client";

import { appContent } from "@/lib/content/app";
import { formatHourLabel, formatTimeInArgentina } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { CalendarDaySummary } from "@/features/calendar/types";

interface DayDetailContentProps {
  summary: CalendarDaySummary;
}

export function DayDetailContent({ summary }: DayDetailContentProps) {
  const copy = appContent.calendar;
  const completed = summary.tasks.filter((t) => t.completed);
  const pending = summary.tasks.filter((t) => !t.completed);

  return (
    <>
      <dl className="grid grid-cols-3 gap-2 border-b border-border/60 px-4 py-3 text-center text-xs sm:px-5 sm:text-sm">
        <div className="rounded-lg bg-background/60 px-2 py-2">
          <dt className="text-muted">{copy.statsTotal}</dt>
          <dd className="text-lg font-semibold tabular-nums text-foreground">{summary.stats.total}</dd>
        </div>
        <div className="rounded-lg bg-success/10 px-2 py-2">
          <dt className="text-success">{copy.statsCompleted}</dt>
          <dd className="text-lg font-semibold tabular-nums text-success">{summary.stats.completed}</dd>
        </div>
        <div className="rounded-lg bg-primary/5 px-2 py-2">
          <dt className="text-muted">{copy.statsPending}</dt>
          <dd className="text-lg font-semibold tabular-nums text-primary">{summary.stats.pending}</dd>
        </div>
      </dl>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {summary.tasks.length === 0 ? (
          <p className="text-sm text-muted">{copy.noTasks}</p>
        ) : (
          <>
            {completed.length > 0 ? (
              <TaskGroup title={copy.completedSection} tasks={completed} variant="completed" />
            ) : null}
            {pending.length > 0 ? (
              <TaskGroup title={copy.pendingSection} tasks={pending} variant="pending" />
            ) : null}
          </>
        )}

        <div className="border-t border-border/60 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">{copy.noteTitle}</h3>
          {summary.noteContent ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {summary.noteContent}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">{copy.noNote}</p>
          )}
        </div>
      </div>
    </>
  );
}

interface TaskGroupProps {
  title: string;
  tasks: CalendarDaySummary["tasks"];
  variant: "completed" | "pending";
}

function TaskGroup({ title, tasks, variant }: TaskGroupProps) {
  const copy = appContent.calendar;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-sm transition-colors duration-200",
              variant === "completed"
                ? "border-success/30 bg-success/5"
                : "border-border/70 bg-background/50",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "font-medium",
                  variant === "completed" && "text-foreground line-through decoration-success/50",
                )}
              >
                {task.title}
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                {formatHourLabel(task.hour)}
              </span>
            </div>
            {variant === "completed" ? (
              <p className="mt-1 text-xs text-muted">
                {task.completedAt ? (
                  <>
                    {copy.completedAtLabel}{" "}
                    <span className="font-mono tabular-nums text-foreground">
                      {formatTimeInArgentina(task.completedAt)}
                    </span>
                  </>
                ) : (
                  copy.completedAtUnknown
                )}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
