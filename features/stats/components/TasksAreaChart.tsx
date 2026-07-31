"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/features/stats/chartTheme";
import type { DailyTaskPoint } from "@/features/stats/types";

interface TasksAreaChartProps {
  data: DailyTaskPoint[];
}

// Stacked area chart: completed vs pending tasks per day.
export function TasksAreaChart({ data }: TasksAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
        />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completadas"
          stackId="tasks"
          stroke={CHART_COLORS.success}
          fill={CHART_COLORS.success}
          fillOpacity={0.55}
        />
        <Area
          type="monotone"
          dataKey="pending"
          name="Pendientes"
          stackId="tasks"
          stroke={CHART_COLORS.cta}
          fill={CHART_COLORS.cta}
          fillOpacity={0.45}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
