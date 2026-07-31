"use client";

import { useCallback, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { appContent } from "@/lib/content/app";
import {
  STATS_CHART_HEIGHT_MAX,
  STATS_CHART_HEIGHT_MIN,
  type StatsChartId,
} from "@/features/stats/chartLayout";
import {
  STATS_ROW_LEFT_FRACTION_MAX,
  STATS_ROW_LEFT_FRACTION_MIN,
  leftFractionFromPointer,
} from "@/features/stats/statsRowLayout";
import { ChartCard } from "@/features/stats/components/ChartCard";
import { cn } from "@/lib/utils/cn";

interface SortableChartCardProps {
  id: StatsChartId;
  title: string;
  description?: string;
  chartHeight: number;
  onChartHeightChange: (height: number) => void;
  className?: string;
  layoutStyle?: React.CSSProperties;
  rowPairLeft?: StatsChartId;
  rowPairRight?: StatsChartId;
  rowLeftFraction?: number;
  onRowLeftFractionChange?: (fraction: number) => void;
  onExpand?: () => void;
  expandLabel?: string;
  children: React.ReactNode;
}

// Sortable + vertically resizable wrapper for a stats chart card.
export function SortableChartCard({
  id,
  title,
  description,
  chartHeight,
  onChartHeightChange,
  className,
  layoutStyle,
  rowPairLeft,
  rowPairRight,
  rowLeftFraction,
  onRowLeftFractionChange,
  onExpand,
  expandLabel,
  children,
}: SortableChartCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const heightDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const widthDragRef = useRef(false);

  const canResizeWidth =
    rowPairLeft != null &&
    rowPairRight != null &&
    rowLeftFraction != null &&
    onRowLeftFractionChange != null &&
    id === rowPairLeft;

  const dragTransform: React.CSSProperties | undefined =
    transform && (transform.x !== 0 || transform.y !== 0)
      ? {
          transform: CSS.Translate.toString(transform),
          transition,
        }
      : undefined;

  const onResizeHeightPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      heightDragRef.current = { startY: event.clientY, startHeight: chartHeight };
      setIsResizingHeight(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [chartHeight],
  );

  const onResizeHeightPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!heightDragRef.current) return;
      const delta = event.clientY - heightDragRef.current.startY;
      onChartHeightChange(heightDragRef.current.startHeight + delta);
    },
    [onChartHeightChange],
  );

  const endHeightResize = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!heightDragRef.current) return;
    heightDragRef.current = null;
    setIsResizingHeight(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const onResizeWidthPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!canResizeWidth) return;
      event.preventDefault();
      event.stopPropagation();
      widthDragRef.current = true;
      setIsResizingWidth(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [canResizeWidth],
  );

  const onResizeWidthPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!widthDragRef.current || !onRowLeftFractionChange) return;
      const row = event.currentTarget.closest("[data-stats-chart-row]") as HTMLElement | null;
      if (!row) return;
      onRowLeftFractionChange(leftFractionFromPointer(row, event.clientX));
    },
    [onRowLeftFractionChange],
  );

  const endWidthResize = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (!widthDragRef.current) return;
    widthDragRef.current = false;
    setIsResizingWidth(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const widthPercent = rowLeftFraction != null ? Math.round(rowLeftFraction * 100) : 50;

  return (
    <div
      ref={setNodeRef}
      style={{ ...layoutStyle, ...dragTransform }}
      className={cn(
        "min-h-0 min-w-0 w-full touch-manipulation md:w-auto",
        className,
        isDragging && "z-20 opacity-90",
      )}
    >
      <ChartCard
        title={title}
        description={description}
        chartHeight={chartHeight}
        dragHandleLabel={appContent.stats.dragChart}
        dragHandleProps={{ ...attributes, ...listeners }}
        expandLabel={expandLabel}
        onExpand={onExpand}
        className={cn("h-full", isDragging && "shadow-md ring-2 ring-primary/25")}
        resizeHandle={
          <button
            type="button"
            aria-label={appContent.stats.resizeChart}
            aria-valuemin={STATS_CHART_HEIGHT_MIN}
            aria-valuemax={STATS_CHART_HEIGHT_MAX}
            aria-valuenow={chartHeight}
            role="slider"
            aria-orientation="vertical"
            onPointerDown={onResizeHeightPointerDown}
            onPointerMove={onResizeHeightPointerMove}
            onPointerUp={endHeightResize}
            onPointerCancel={endHeightResize}
            className={cn(
              "absolute inset-x-3 bottom-0 z-10 h-2 cursor-row-resize touch-none rounded-full",
              "bg-transparent transition-colors duration-150 hover:bg-primary/35",
              isResizingHeight && "bg-primary/45",
            )}
          />
        }
        widthResizeHandle={
          canResizeWidth ? (
            <button
              type="button"
              aria-label={appContent.stats.resizeChartWidth}
              aria-valuemin={Math.round(STATS_ROW_LEFT_FRACTION_MIN * 100)}
              aria-valuemax={Math.round(STATS_ROW_LEFT_FRACTION_MAX * 100)}
              aria-valuenow={widthPercent}
              role="slider"
              aria-orientation="horizontal"
              onPointerDown={onResizeWidthPointerDown}
              onPointerMove={onResizeWidthPointerMove}
              onPointerUp={endWidthResize}
              onPointerCancel={endWidthResize}
              className={cn(
                "absolute top-12 right-0 z-10 hidden h-[calc(100%-3.5rem)] w-2 -translate-x-1/2 cursor-col-resize touch-none rounded-full md:block",
                "bg-transparent transition-colors duration-150 hover:bg-primary/35",
                isResizingWidth && "bg-primary/45",
              )}
            />
          ) : null
        }
      >
        {children}
      </ChartCard>
    </div>
  );
}
