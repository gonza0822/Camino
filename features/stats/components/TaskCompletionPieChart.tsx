"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/features/stats/chartTheme";
import type { TaskCompletionSlice } from "@/features/stats/types";

interface TaskCompletionPieChartProps {
  data: TaskCompletionSlice[];
}

const SLICE_COLORS: Record<TaskCompletionSlice["key"], string> = {
  completed: CHART_COLORS.primary,
  pending: CHART_COLORS.cta,
};

// Donut chart: completed vs pending tasks this month.
export function TaskCompletionPieChart({ data }: TaskCompletionPieChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="48%"
          outerRadius="72%"
          paddingAngle={total > 0 ? 2 : 0}
        >
          {data.map((slice) => (
            <Cell key={slice.key} fill={SLICE_COLORS[slice.key]} stroke={CHART_COLORS.soft} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value, name) => [value ?? 0, String(name)]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
