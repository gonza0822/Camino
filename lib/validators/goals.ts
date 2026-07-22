import { z } from "zod";

export const goalTitleSchema = z.object({
  title: z.string().trim().min(1).max(300),
});

export const weeklyGoalSchema = goalTitleSchema.extend({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const monthlyGoalSchema = goalTitleSchema.extend({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const annualGoalSchema = goalTitleSchema.extend({
  year: z.number().int().min(2000).max(2100),
});
