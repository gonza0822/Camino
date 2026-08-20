"use server";

import { requireUserId } from "@/lib/auth/session";
import {
  createReminder,
  deleteReminder,
  updateReminder,
} from "@/lib/services/reminderService";
import {
  reminderCreateSchema,
  reminderUpdateSchema,
} from "@/lib/validators/reminder";

// Creates a personal reminder shown on the today dashboard.
export async function createReminderAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = reminderCreateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" as const };

  try {
    const reminder = await createReminder(userId, parsed.data.title);
    return { success: true as const, reminder };
  } catch {
    return { error: "Server error" as const };
  }
}

// Updates a reminder owned by the current user.
export async function updateReminderAction(reminderId: string, input: unknown) {
  const userId = await requireUserId();
  if (typeof reminderId !== "string" || !reminderId) {
    return { error: "Invalid input" as const };
  }

  const parsed = reminderUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" as const };

  try {
    const reminder = await updateReminder(userId, reminderId, parsed.data);
    if (!reminder) return { error: "Not found" as const };
    return { success: true as const, reminder };
  } catch {
    return { error: "Server error" as const };
  }
}

// Deletes a reminder owned by the current user.
export async function deleteReminderAction(reminderId: string) {
  const userId = await requireUserId();
  if (typeof reminderId !== "string" || !reminderId) {
    return { error: "Invalid input" as const };
  }

  try {
    const deleted = await deleteReminder(userId, reminderId);
    if (!deleted) return { error: "Not found" as const };
    return { success: true as const };
  } catch {
    return { error: "Server error" as const };
  }
}
