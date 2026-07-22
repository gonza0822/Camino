"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/services/taskService";
import { taskSchema, taskUpdateSchema } from "@/lib/validators/tasks";

// Creates a task in an hourly slot.
export async function createTaskAction(input: unknown) {
  const userId = await requireUserId();
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    await createTask(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/semanal");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_OCCUPIED") {
      return { error: "SLOT_OCCUPIED" };
    }
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
  return { success: true };
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
