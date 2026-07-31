export const STATS_CHART_IDS = [
  "completedPerDay",
  "tasksStacked",
  "completionMix",
  "goalsProgress",
] as const;

export type StatsChartId = (typeof STATS_CHART_IDS)[number];

export const STATS_CHART_HEIGHT_MIN = 180;
export const STATS_CHART_HEIGHT_MAX = 560;
export const STATS_CHART_HEIGHT_DEFAULT = 260;

export interface StatsChartLayout {
  order: StatsChartId[];
  heights: Record<StatsChartId, number>;
  /** Left width fraction (0.22–0.78) per pair key `leftId|rightId`. */
  rowSplits: Record<string, number>;
}

const STORAGE_KEY = "camino-stats-chart-layout";

export const DEFAULT_STATS_CHART_LAYOUT: StatsChartLayout = {
  order: [...STATS_CHART_IDS],
  heights: {
    completedPerDay: STATS_CHART_HEIGHT_DEFAULT,
    tasksStacked: STATS_CHART_HEIGHT_DEFAULT,
    completionMix: STATS_CHART_HEIGHT_DEFAULT,
    goalsProgress: STATS_CHART_HEIGHT_DEFAULT,
  },
  rowSplits: {},
};

function clampHeight(value: number): number {
  return Math.min(STATS_CHART_HEIGHT_MAX, Math.max(STATS_CHART_HEIGHT_MIN, value));
}

function isStatsChartId(value: string): value is StatsChartId {
  return (STATS_CHART_IDS as readonly string[]).includes(value);
}

import { normalizeRowSplitValue } from "@/features/stats/statsRowLayout";
export function loadStatsChartLayout(): StatsChartLayout {
  if (typeof window === "undefined") {
    return DEFAULT_STATS_CHART_LAYOUT;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS_CHART_LAYOUT;

    const parsed = JSON.parse(raw) as Partial<StatsChartLayout>;
    const order = Array.isArray(parsed.order)
      ? parsed.order.filter(isStatsChartId)
      : [...DEFAULT_STATS_CHART_LAYOUT.order];

    const uniqueOrder = [...new Set(order)] as StatsChartId[];
    for (const id of STATS_CHART_IDS) {
      if (!uniqueOrder.includes(id)) uniqueOrder.push(id);
    }

    const heights = { ...DEFAULT_STATS_CHART_LAYOUT.heights };
    if (parsed.heights && typeof parsed.heights === "object") {
      for (const id of STATS_CHART_IDS) {
        const raw = parsed.heights[id];
        const value = typeof raw === "number" ? raw : Number(raw);
        if (Number.isFinite(value)) {
          heights[id] = clampHeight(value);
        }
      }
    }

    const rowSplits: Record<string, number> = {};
    if (parsed.rowSplits && typeof parsed.rowSplits === "object") {
      for (const [key, raw] of Object.entries(parsed.rowSplits)) {
        const value = typeof raw === "number" ? raw : Number(raw);
        if (Number.isFinite(value)) {
          rowSplits[key] = normalizeRowSplitValue(value);
        }
      }
    }

    return { order: uniqueOrder, heights, rowSplits };
  } catch {
    return DEFAULT_STATS_CHART_LAYOUT;
  }
}

export function saveStatsChartLayout(layout: StatsChartLayout): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    /* quota or private mode */
  }
}

export function clampChartHeight(value: number): number {
  return clampHeight(value);
}
