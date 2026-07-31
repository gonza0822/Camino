"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from "@/features/stats/chartTheme";
import type { GoalProgressBar } from "@/features/stats/types";

interface GoalsProgressBarChartProps {
  data: GoalProgressBar[];
}

// Grouped bar chart: completed vs pending goals by period.
export function GoalsProgressBarChart({ data }: GoalsProgressBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.border} strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: CHART_COLORS.border }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: CHART_COLORS.muted, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
        <Bar
          dataKey="completed"
          name="Completados"
          fill={CHART_COLORS.primary}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="pending"
          name="Pendientes"
          fill={CHART_COLORS.secondary}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
