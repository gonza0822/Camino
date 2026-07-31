import { z } from "zod";

export const dailyNoteSaveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().max(10000),
});

export type DailyNoteSaveInput = z.infer<typeof dailyNoteSaveSchema>;
