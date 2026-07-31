export interface DailyTaskPoint {
  date: string;
  label: string;
  completed: number;
  pending: number;
  total: number;
}

export interface TaskCompletionSlice {
  name: string;
  value: number;
  key: "completed" | "pending";
}

export interface GoalProgressBar {
  name: string;
  completed: number;
  pending: number;
}

export interface DashboardStats {
  monthLabel: string;
  dailyTasks: DailyTaskPoint[];
  completionBreakdown: TaskCompletionSlice[];
  goalsProgress: GoalProgressBar[];
}
