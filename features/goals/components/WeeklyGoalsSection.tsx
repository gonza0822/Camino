"use client";

import { appContent } from "@/lib/content/app";
import { GoalList } from "@/features/goals/components/GoalList";
import type { GoalDto } from "@/types/app";

interface WeeklyGoalsSectionProps {
  weekStart: string;
  goals: GoalDto[];
  createAction: (input: unknown) => Promise<{ error?: string }>;
  updateAction: (id: string, input: unknown) => Promise<{ error?: string }>;
  deleteAction: (id: string) => Promise<{ error?: string }>;
}

export function WeeklyGoalsSection({
  weekStart,
  goals,
  createAction,
  updateAction,
  deleteAction,
}: WeeklyGoalsSectionProps) {
  return (
    <GoalList
      goals={goals}
      placeholder={appContent.weekly.goalPlaceholder}
      onCreate={(title) => createAction({ weekStart, title })}
      onUpdate={updateAction}
      onDelete={deleteAction}
    />
  );
}
