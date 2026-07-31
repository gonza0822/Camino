"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { appContent } from "@/lib/content/app";
import { CompletedTasksLineChart } from "@/features/stats/components/CompletedTasksLineChart";
import { TasksAreaChart } from "@/features/stats/components/TasksAreaChart";
import { TaskCompletionPieChart } from "@/features/stats/components/TaskCompletionPieChart";
import { GoalsProgressBarChart } from "@/features/stats/components/GoalsProgressBarChart";
import { ChartCard } from "@/features/stats/components/ChartCard";
import { ChartExpandModal } from "@/features/stats/components/ChartExpandModal";
import { SortableChartCard } from "@/features/stats/components/SortableChartCard";
import { useStatsChartLayout } from "@/features/stats/hooks/useStatsChartLayout";
import {
  DEFAULT_STATS_CHART_LAYOUT,
  STATS_CHART_HEIGHT_DEFAULT,
  type StatsChartId,
} from "@/features/stats/chartLayout";
import {
  chunkStatsChartRows,
  leftFractionForPair,
  rowItemFlexStyle,
  STATS_ROW_LEFT_FRACTION_DEFAULT,
} from "@/features/stats/statsRowLayout";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import type { DashboardStats } from "@/features/stats/types";

interface StatsDashboardProps {
  stats: DashboardStats;
}

function rowKey(row: StatsChartId[]): string {
  return row.join("-");
}

// Desktop: reorderable chart grid. Mobile: title buttons that open each chart in a modal.
export function StatsDashboard({ stats }: StatsDashboardProps) {
  const copy = appContent.stats;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { layout, hydrated, setOrder, setChartHeight, setRowLeftFraction } = useStatsChartLayout();
  const [activeId, setActiveId] = useState<StatsChartId | null>(null);
  const [expandedChartId, setExpandedChartId] = useState<StatsChartId | null>(null);

  const displayLayout = hydrated ? layout : DEFAULT_STATS_CHART_LAYOUT;
  const rows = useMemo(() => chunkStatsChartRows(displayLayout.order), [displayLayout.order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const chartMeta = useMemo(
    () =>
      ({
        completedPerDay: {
          title: copy.charts.completedPerDay,
          description: stats.monthLabel,
        },
        tasksStacked: {
          title: copy.charts.tasksStacked,
          description: stats.monthLabel,
        },
        completionMix: {
          title: copy.charts.completionMix,
          description: stats.monthLabel,
        },
        goalsProgress: {
          title: copy.charts.goalsProgress,
          description: copy.goalsHint,
        },
      }) satisfies Record<StatsChartId, { title: string; description: string }>,
    [copy, stats.monthLabel],
  );

  function renderChart(id: StatsChartId) {
    switch (id) {
      case "completedPerDay":
        return <CompletedTasksLineChart data={stats.dailyTasks} />;
      case "tasksStacked":
        return <TasksAreaChart data={stats.dailyTasks} />;
      case "completionMix":
        return <TaskCompletionPieChart data={stats.completionBreakdown} />;
      case "goalsProgress":
        return <GoalsProgressBarChart data={stats.goalsProgress} />;
      default:
        return null;
    }
  }

  function chartHeightFor(id: StatsChartId): number {
    return displayLayout.heights[id] ?? STATS_CHART_HEIGHT_DEFAULT;
  }

  function chartExpandProps(id: StatsChartId) {
    return {
      expandLabel: copy.expandChart,
      onExpand: () => setExpandedChartId(id),
    };
  }

  function renderChartRows(sortable: boolean) {
    return (
      <div className="flex flex-col gap-4 md:gap-5">
        {rows.map((row) => {
          const leftFraction =
            row.length === 2
              ? leftFractionForPair(displayLayout, row[0], row[1])
              : STATS_ROW_LEFT_FRACTION_DEFAULT;

          return (
            <div
              key={rowKey(row)}
              data-stats-chart-row
              className="flex flex-col gap-4 md:flex-row md:gap-5"
            >
              {row.map((id, columnIndex) => {
                const layoutStyle = rowItemFlexStyle(columnIndex, row.length, leftFraction);

                if (sortable) {
                  return (
                    <SortableChartCard
                      key={id}
                      id={id}
                      title={chartMeta[id].title}
                      description={chartMeta[id].description}
                      chartHeight={chartHeightFor(id)}
                      onChartHeightChange={(height) => setChartHeight(id, height)}
                      layoutStyle={layoutStyle}
                      rowPairLeft={row.length === 2 ? row[0] : undefined}
                      rowPairRight={row.length === 2 ? row[1] : undefined}
                      rowLeftFraction={row.length === 2 ? leftFraction : undefined}
                      onRowLeftFractionChange={
                        row.length === 2
                          ? (fraction) => setRowLeftFraction(row[0], row[1], fraction)
                          : undefined
                      }
                      {...chartExpandProps(id)}
                    >
                      {renderChart(id)}
                    </SortableChartCard>
                  );
                }

                return (
                  <div key={id} className="min-w-0 w-full md:w-auto" style={layoutStyle}>
                    <ChartCard
                      title={chartMeta[id].title}
                      description={chartMeta[id].description}
                      chartHeight={chartHeightFor(id)}
                      {...chartExpandProps(id)}
                    >
                      {renderChart(id)}
                    </ChartCard>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id;
    if (typeof id === "string") {
      setActiveId(id as StatsChartId);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((currentOrder) => {
      const oldIndex = currentOrder.indexOf(active.id as StatsChartId);
      const newIndex = currentOrder.indexOf(over.id as StatsChartId);
      if (oldIndex === -1 || newIndex === -1) return currentOrder;
      return arrayMove(currentOrder, oldIndex, newIndex);
    });
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const expandedModal = (
    <ChartExpandModal
      open={expandedChartId != null}
      title={expandedChartId ? chartMeta[expandedChartId].title : ""}
      description={expandedChartId ? chartMeta[expandedChartId].description : undefined}
      onClose={() => setExpandedChartId(null)}
    >
      <div className="h-full w-full min-h-0">{expandedChartId ? renderChart(expandedChartId) : null}</div>
    </ChartExpandModal>
  );

  if (!isDesktop) {
    return (
      <>
        <ul className="flex flex-col gap-3 pb-4" aria-label={copy.title}>
          {displayLayout.order.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setExpandedChartId(id)}
                aria-label={`${copy.openChart}: ${chartMeta[id].title}`}
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center justify-between gap-3",
                  "rounded-xl border border-border/80 bg-surface/90 px-4 py-3.5 text-left shadow-sm",
                  "transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-primary">{chartMeta[id].title}</span>
                  {chartMeta[id].description ? (
                    <span className="mt-0.5 block text-xs text-muted">{chartMeta[id].description}</span>
                  ) : null}
                </span>
                <svg
                  className="h-5 w-5 shrink-0 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        {expandedModal}
      </>
    );
  }

  if (!hydrated) {
    return (
      <>
        {renderChartRows(false)}
        {expandedModal}
      </>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={displayLayout.order} strategy={rectSortingStrategy}>
          {renderChartRows(true)}
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeId ? (
            <div className="opacity-95 shadow-lg">
              <ChartCard
                title={chartMeta[activeId].title}
                description={chartMeta[activeId].description}
                chartHeight={chartHeightFor(activeId)}
                dragHandleLabel={copy.dragChart}
              >
                {renderChart(activeId)}
              </ChartCard>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {expandedModal}
    </>
  );
}
