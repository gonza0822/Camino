"use client";

import { appContent } from "@/lib/content/app";
import { GoalList } from "@/features/goals/components/GoalList";
import type { GoalDto } from "@/types/app";

interface MonthlyGoalsSectionProps {
  year: number;
  month: number;
  goals: GoalDto[];
  createAction: (input: unknown) => Promise<{ error?: string }>;
  updateAction: (id: string, input: unknown) => Promise<{ error?: string }>;
  deleteAction: (id: string) => Promise<{ error?: string }>;
}

export function MonthlyGoalsSection({
  year,
  month,
  goals,
  createAction,
  updateAction,
  deleteAction,
}: MonthlyGoalsSectionProps) {
  return (
    <GoalList
      goals={goals}
      placeholder={appContent.monthlyGoals.goalPlaceholder}
      onCreate={(title) => createAction({ year, month, title })}
      onUpdate={updateAction}
      onDelete={deleteAction}
    />
  );
}
