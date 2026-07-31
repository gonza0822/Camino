"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { saveDailyNote } from "@/lib/services/dailyNoteService";
import { dailyNoteSaveSchema } from "@/lib/validators/dailyNote";

// Persists today's free-form note from the dashboard panel.
export async function saveDailyNoteAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = dailyNoteSaveSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    const note = await saveDailyNote(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/calendario");
    return { success: true, note };
  } catch {
    return { error: "Server error" };
  }
}
