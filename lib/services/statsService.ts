import { getTasksByDateRange } from "@/lib/services/taskService";
import {
  getAnnualGoals,
  getMonthlyGoals,
  getWeeklyGoals,
} from "@/lib/services/goalService";
import {
  getArgentinaYearMonth,
  getMonday,
  getMonthDateKeys,
  getMonthName,
  getTodayKey,
  parseDateKey,
  toDateKey,
} from "@/lib/utils/date";
import type { DashboardStats, DailyTaskPoint } from "@/features/stats/types";

// Builds chart-ready stats for the current month and active goal periods.
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const today = getTodayKey();
  const { year, month } = getArgentinaYearMonth();
  const monthDates = getMonthDateKeys(year, month).filter((date) => date <= today);
  const weekStart = toDateKey(getMonday(parseDateKey(today)));

  const [tasks, weeklyGoals, monthlyGoals, annualGoals] = await Promise.all([
    getTasksByDateRange(userId, monthDates),
    getWeeklyGoals(userId, weekStart),
    getMonthlyGoals(userId, year, month),
    getAnnualGoals(userId, year),
  ]);

  const byDate = new Map<string, { completed: number; pending: number }>();
  for (const date of monthDates) {
    byDate.set(date, { completed: 0, pending: 0 });
  }
  for (const task of tasks) {
    const bucket = byDate.get(task.date);
    if (!bucket) continue;
    if (task.completed) bucket.completed += 1;
    else bucket.pending += 1;
  }

  const dailyTasks: DailyTaskPoint[] = monthDates.map((date) => {
    const bucket = byDate.get(date) ?? { completed: 0, pending: 0 };
    return {
      date,
      label: String(Number(date.slice(8, 10))),
      completed: bucket.completed,
      pending: bucket.pending,
      total: bucket.completed + bucket.pending,
    };
  });

  const completedTotal = dailyTasks.reduce((sum, d) => sum + d.completed, 0);
  const pendingTotal = dailyTasks.reduce((sum, d) => sum + d.pending, 0);

  function goalBars(
    name: string,
    goals: Array<{ completed: boolean }>,
  ): { name: string; completed: number; pending: number } {
    const completed = goals.filter((g) => g.completed).length;
    return {
      name,
      completed,
      pending: Math.max(0, goals.length - completed),
    };
  }

  return {
    monthLabel: `${getMonthName(month)} ${year}`,
    dailyTasks,
    completionBreakdown: [
      { name: "Completadas", value: completedTotal, key: "completed" },
      { name: "Pendientes", value: pendingTotal, key: "pending" },
    ],
    goalsProgress: [
      goalBars("Semana", weeklyGoals),
      goalBars("Mes", monthlyGoals),
      goalBars("Año", annualGoals),
    ],
  };
}
