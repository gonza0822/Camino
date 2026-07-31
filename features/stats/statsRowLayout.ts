import type { CSSProperties } from "react";
import type { StatsChartId, StatsChartLayout } from "@/features/stats/chartLayout";

/** Min share of row width for the left card (0–1). */
export const STATS_ROW_LEFT_FRACTION_MIN = 0.22;
/** Max share of row width for the left card (0–1). */
export const STATS_ROW_LEFT_FRACTION_MAX = 0.78;
export const STATS_ROW_LEFT_FRACTION_DEFAULT = 0.5;

export function statsRowPairKey(left: StatsChartId, right: StatsChartId): string {
  return `${left}|${right}`;
}

// Splits chart order into rows of up to two cards (desktop row pairs).
export function chunkStatsChartRows(order: StatsChartId[]): StatsChartId[][] {
  const rows: StatsChartId[][] = [];
  for (let i = 0; i < order.length; i += 2) {
    rows.push(order.slice(i, i + 2));
  }
  return rows;
}

export function clampRowLeftFraction(value: number): number {
  return Math.min(
    STATS_ROW_LEFT_FRACTION_MAX,
    Math.max(STATS_ROW_LEFT_FRACTION_MIN, value),
  );
}

// Normalizes persisted split (legacy 1–3 columns or 0–1 fraction).
export function normalizeRowSplitValue(value: number): number {
  if (!Number.isFinite(value)) return STATS_ROW_LEFT_FRACTION_DEFAULT;
  if (value >= 1 && value <= 3 && Number.isInteger(value)) {
    return clampRowLeftFraction(value / 4);
  }
  if (value > 1 && value <= 100) {
    return clampRowLeftFraction(value / 100);
  }
  return clampRowLeftFraction(value);
}

// Left width fraction for a pair; default is 50/50.
export function leftFractionForPair(
  layout: StatsChartLayout,
  left: StatsChartId,
  right: StatsChartId,
): number {
  const key = statsRowPairKey(left, right);
  const stored = layout.rowSplits[key];
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return normalizeRowSplitValue(stored);
  }
  return STATS_ROW_LEFT_FRACTION_DEFAULT;
}

// Maps pointer X within a row to a continuous left width fraction.
export function leftFractionFromPointer(rowElement: HTMLElement, clientX: number): number {
  const rect = rowElement.getBoundingClientRect();
  if (rect.width <= 0) return STATS_ROW_LEFT_FRACTION_DEFAULT;
  const ratio = (clientX - rect.left) / rect.width;
  return clampRowLeftFraction(ratio);
}

export function rowItemFlexStyle(
  columnIndex: number,
  rowLength: number,
  leftFraction: number,
): CSSProperties | undefined {
  if (rowLength !== 2) {
    return { flex: "1 1 100%", minWidth: 0 };
  }
  const share = columnIndex === 0 ? leftFraction : 1 - leftFraction;
  return {
    flexGrow: share,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
  };
}
