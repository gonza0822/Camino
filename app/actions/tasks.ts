"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserId } from "@/lib/auth/session";
import {
  createTask,
  updateTask,
  deleteTask,
  saveTaskSlot,
} from "@/lib/services/taskService";
import { taskSchema, taskUpdateSchema } from "@/lib/validators/tasks";

const slotSaveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hour: z.number().int().min(0).max(23),
  title: z.string().max(200),
});

// Creates a task in an hourly slot.
export async function createTaskAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    const task = await createTask(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/semanal");
    return { success: true, task };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_OCCUPIED") {
      return { error: "SLOT_OCCUPIED" };
    }
    return { error: "Server error" };
  }
}

// Saves an hourly slot from inline editing (create, update, or clear).
export async function saveTaskSlotAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = slotSaveSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    const task = await saveTaskSlot(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/semanal");
    return { success: true, task };
  } catch {
    return { error: "Server error" };
  }
}

// Updates task title or completion status.
export async function updateTaskAction(taskId: string, input: unknown) {
  const userId = await requireUserId();
  const parsed = taskUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const task = await updateTask(userId, taskId, parsed.data);
  if (!task) return { error: "Not found" };

  revalidatePath("/");
  revalidatePath("/semanal");
  return { success: true, task };
}

// Deletes a task.
export async function deleteTaskAction(taskId: string) {
  const userId = await requireUserId();
  const deleted = await deleteTask(userId, taskId);
  if (!deleted) return { error: "Not found" };

  revalidatePath("/");
  revalidatePath("/semanal");
  return { success: true };
}
