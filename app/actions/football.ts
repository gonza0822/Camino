"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { createTask } from "@/lib/services/taskService";
import {
  isDateInCurrentWeek,
  matchTimeToAgendaHour,
} from "@/lib/utils/date";

const addMatchSchema = z.object({
  matchId: z.string().trim().min(1).max(40),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().trim().max(16).nullable(),
  homeTeam: z.string().trim().min(1).max(80),
  awayTeam: z.string().trim().min(1).max(80),
});

// Adds a football match into the weekly agenda at its kickoff day/hour.
export async function addFootballMatchToAgendaAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = addMatchSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" as const };

  const { date, time, homeTeam, awayTeam } = parsed.data;

  if (!isDateInCurrentWeek(date)) {
    return { error: "OUT_OF_WEEK" as const };
  }

  const hour = matchTimeToAgendaHour(time);
  const title = `Partido: ${homeTeam} vs ${awayTeam}`.slice(0, 200);

  try {
    const task = await createTask(userId, { date, hour, title });
    revalidatePath("/");
    revalidatePath("/semanal");
    return { success: true as const, task, hour };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_OCCUPIED") {
      return { error: "SLOT_OCCUPIED" as const, hour };
    }
    return { error: "Server error" as const };
  }
}
