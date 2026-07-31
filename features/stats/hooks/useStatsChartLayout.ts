"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clampChartHeight,
  DEFAULT_STATS_CHART_LAYOUT,
  loadStatsChartLayout,
  saveStatsChartLayout,
  type StatsChartId,
  type StatsChartLayout,
} from "@/features/stats/chartLayout";
import { clampRowLeftFraction, statsRowPairKey } from "@/features/stats/statsRowLayout";

// Client layout state (order + heights) with localStorage persistence.
export function useStatsChartLayout() {
  const [layout, setLayout] = useState<StatsChartLayout>(DEFAULT_STATS_CHART_LAYOUT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLayout(loadStatsChartLayout());
    setHydrated(true);
  }, []);

  const setOrder = useCallback((orderOrUpdater: StatsChartId[] | ((order: StatsChartId[]) => StatsChartId[])) => {
    setLayout((prev) => {
      const order =
        typeof orderOrUpdater === "function" ? orderOrUpdater(prev.order) : orderOrUpdater;
      const next = { ...prev, order };
      saveStatsChartLayout(next);
      return next;
    });
  }, []);

  const setChartHeight = useCallback((id: StatsChartId, height: number) => {
    const clamped = clampChartHeight(height);
    setLayout((prev) => {
      const next = {
        ...prev,
        heights: { ...prev.heights, [id]: clamped },
      };
      saveStatsChartLayout(next);
      return next;
    });
  }, []);

  const setRowLeftFraction = useCallback(
    (left: StatsChartId, right: StatsChartId, leftFraction: number) => {
      const key = statsRowPairKey(left, right);
      const clamped = clampRowLeftFraction(leftFraction);
      setLayout((prev) => {
        const next = {
          ...prev,
          rowSplits: { ...prev.rowSplits, [key]: clamped },
        };
        saveStatsChartLayout(next);
        return next;
      });
    },
    [],
  );

  return {
    layout,
    hydrated,
    setOrder,
    setChartHeight,
    setRowLeftFraction,
  };
}
