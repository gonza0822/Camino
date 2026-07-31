"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/features/stats/chartTheme";
import type { DailyTaskPoint } from "@/features/stats/types";

interface CompletedTasksLineChartProps {
  data: DailyTaskPoint[];
}

// Line chart: completed tasks per day in the current month.
export function CompletedTasksLineChart({ data }: CompletedTasksLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.border} strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.border }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          labelFormatter={(_, payload) => {
            const point = payload?.[0]?.payload as DailyTaskPoint | undefined;
            return point?.date ?? "";
          }}
          formatter={(value) => [value ?? 0, "Completadas"]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
        <Line
          type="monotone"
          dataKey="completed"
          name="Completadas"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.5}
          dot={{ r: 3, fill: CHART_COLORS.primary }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
