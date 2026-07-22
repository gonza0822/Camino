"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import {
  createWeeklyGoal,
  updateWeeklyGoal,
  deleteWeeklyGoal,
  createMonthlyGoal,
  updateMonthlyGoal,
  deleteMonthlyGoal,
  createAnnualGoal,
  updateAnnualGoal,
  deleteAnnualGoal,
} from "@/lib/services/goalService";
import {
  weeklyGoalSchema,
  monthlyGoalSchema,
  annualGoalSchema,
} from "@/lib/validators/goals";

const goalUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  completed: z.boolean().optional(),
});

// Creates a weekly goal.
export async function createWeeklyGoalAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = weeklyGoalSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  await createWeeklyGoal(userId, parsed.data.weekStart, parsed.data.title);
  revalidatePath("/semanal");
  return { success: true };
}

// Updates a weekly goal.
export async function updateWeeklyGoalAction(goalId: string, input: unknown) {
  const userId = await requireUserId();
  const parsed = goalUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const goal = await updateWeeklyGoal(userId, goalId, parsed.data);
  if (!goal) return { error: "Not found" };
  revalidatePath("/semanal");
  return { success: true };
}

// Deletes a weekly goal.
export async function deleteWeeklyGoalAction(goalId: string) {
  const userId = await requireUserId();
  const deleted = await deleteWeeklyGoal(userId, goalId);
  if (!deleted) return { error: "Not found" };
  revalidatePath("/semanal");
  return { success: true };
}

// Creates a monthly goal.
export async function createMonthlyGoalAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = monthlyGoalSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  await createMonthlyGoal(userId, parsed.data.year, parsed.data.month, parsed.data.title);
  revalidatePath("/objetivos-mensuales");
  return { success: true };
}

// Updates a monthly goal.
export async function updateMonthlyGoalAction(goalId: string, input: unknown) {
  const userId = await requireUserId();
  const parsed = goalUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const goal = await updateMonthlyGoal(userId, goalId, parsed.data);
  if (!goal) return { error: "Not found" };
  revalidatePath("/objetivos-mensuales");
  return { success: true };
}

// Deletes a monthly goal.
export async function deleteMonthlyGoalAction(goalId: string) {
  const userId = await requireUserId();
  const deleted = await deleteMonthlyGoal(userId, goalId);
  if (!deleted) return { error: "Not found" };
  revalidatePath("/objetivos-mensuales");
  return { success: true };
}

// Creates an annual goal.
export async function createAnnualGoalAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = annualGoalSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  await createAnnualGoal(userId, parsed.data.year, parsed.data.title);
  revalidatePath("/objetivos-anuales");
  return { success: true };
}

// Updates an annual goal.
export async function updateAnnualGoalAction(goalId: string, input: unknown) {
  const userId = await requireUserId();
  const parsed = goalUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const goal = await updateAnnualGoal(userId, goalId, parsed.data);
  if (!goal) return { error: "Not found" };
  revalidatePath("/objetivos-anuales");
  return { success: true };
}

// Deletes an annual goal.
export async function deleteAnnualGoalAction(goalId: string) {
  const userId = await requireUserId();
  const deleted = await deleteAnnualGoal(userId, goalId);
  if (!deleted) return { error: "Not found" };
  revalidatePath("/objetivos-anuales");
  return { success: true };
}
