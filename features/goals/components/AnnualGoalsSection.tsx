"use client";

import { appContent } from "@/lib/content/app";
import { GoalList } from "@/features/goals/components/GoalList";
import type { GoalDto } from "@/types/app";

interface AnnualGoalsSectionProps {
  year: number;
  goals: GoalDto[];
  createAction: (input: unknown) => Promise<{ error?: string }>;
  updateAction: (id: string, input: unknown) => Promise<{ error?: string }>;
  deleteAction: (id: string) => Promise<{ error?: string }>;
}

export function AnnualGoalsSection({
  year,
  goals,
  createAction,
  updateAction,
  deleteAction,
}: AnnualGoalsSectionProps) {
  return (
    <GoalList
      goals={goals}
      placeholder={appContent.annualGoals.goalPlaceholder}
      onCreate={(title) => createAction({ year, title })}
      onUpdate={updateAction}
      onDelete={deleteAction}
    />
  );
}
