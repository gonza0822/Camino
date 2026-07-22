import { z } from "zod";

export const taskSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hour: z.number().int().min(0).max(23),
  title: z.string().trim().min(1).max(200),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export type TaskInput = z.infer<typeof taskSchema>;
