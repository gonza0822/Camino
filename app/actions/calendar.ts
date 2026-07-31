"use server";

import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import { getCalendarDaySummary } from "@/lib/services/calendarService";

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Loads tasks and note for the calendar day detail modal.
export async function getCalendarDaySummaryAction(date: string) {
  const userId = await requireUserId();
  const parsed = dateKeySchema.safeParse(date);
  if (!parsed.success) return { error: "Invalid input" as const };

  try {
    const summary = await getCalendarDaySummary(userId, parsed.data);
    return { success: true as const, summary };
  } catch {
    return { error: "Server error" as const };
  }
}
