"use client";

import { STATS_CHART_HEIGHT_MIN } from "@/features/stats/chartLayout";
import { cn } from "@/lib/utils/cn";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  chartHeight: number;
  dragHandleLabel?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  expandLabel?: string;
  onExpand?: () => void;
  resizeHandle?: React.ReactNode;
  widthResizeHandle?: React.ReactNode;
}

// Surface card that wraps a chart with a fixed height for ResponsiveContainer.
export function ChartCard({
  title,
  description,
  children,
  className,
  chartHeight,
  dragHandleLabel,
  dragHandleProps,
  expandLabel,
  onExpand,
  resizeHandle,
  widthResizeHandle,
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-col rounded-xl border border-border/80 bg-surface/90 p-3 shadow-sm backdrop-blur-sm sm:p-4",
        className,
      )}
    >
      <header className="mb-2 flex shrink-0 items-start gap-2">
        {dragHandleProps && dragHandleLabel ? (
          <button
            type="button"
            {...dragHandleProps}
            aria-label={dragHandleLabel}
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md",
              "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary active:cursor-grabbing",
            )}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-primary sm:text-base">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {onExpand && expandLabel ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onExpand();
            }}
            aria-label={expandLabel}
            className={cn(
              "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md",
              "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        ) : null}
      </header>
      <div
        className="relative w-full shrink-0 overflow-hidden"
        style={{
          height: Math.max(chartHeight, STATS_CHART_HEIGHT_MIN),
          minHeight: STATS_CHART_HEIGHT_MIN,
        }}
      >
        <div className="h-full w-full">{children}</div>
      </div>
      {resizeHandle}
      {widthResizeHandle}
    </section>
  );
}
