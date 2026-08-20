export interface TaskDto {
  id: string;
  date: string;
  hour: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface GoalDto {
  id: string;
  title: string;
  completed: boolean;
  sortOrder: number;
}

export interface ReminderDto {
  id: string;
  title: string;
  completed: boolean;
  sortOrder: number;
}

export interface WeeklyGoalDto extends GoalDto {
  weekStart: string;
}

export interface MonthlyGoalDto extends GoalDto {
  year: number;
  month: number;
}

export interface AnnualGoalDto extends GoalDto {
  year: number;
}
