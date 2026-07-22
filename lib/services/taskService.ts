import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/mongodb";
import { Task } from "@/lib/db/models/Task";
import type { TaskDto } from "@/types/app";
import type { TaskInput } from "@/lib/validators/tasks";

function toTaskDto(doc: {
  _id: Types.ObjectId;
  date: string;
  hour: number;
  title: string;
  completed: boolean;
}): TaskDto {
  return {
    id: doc._id.toString(),
    date: doc.date,
    hour: doc.hour,
    title: doc.title,
    completed: doc.completed,
  };
}

// Lists tasks for a user on a single date.
export async function getTasksByDate(userId: string, date: string): Promise<TaskDto[]> {
  await connectMongo();
  const tasks = await Task.find({ userId, date }).sort({ hour: 1 }).lean();
  return tasks.map(toTaskDto);
}

// Lists tasks for a user across a date range.
export async function getTasksByDateRange(
  userId: string,
  dates: string[],
): Promise<TaskDto[]> {
  await connectMongo();
  const tasks = await Task.find({ userId, date: { $in: dates } })
    .sort({ date: 1, hour: 1 })
    .lean();
  return tasks.map(toTaskDto);
}

// Creates a task for a user.
export async function createTask(userId: string, input: TaskInput): Promise<TaskDto> {
  await connectMongo();
  const existing = await Task.findOne({
    userId,
    date: input.date,
    hour: input.hour,
  });
  if (existing) {
    throw new Error("SLOT_OCCUPIED");
  }

  const task = await Task.create({ userId, ...input });
  return toTaskDto(task);
}

// Updates a task owned by the user.
export async function updateTask(
  userId: string,
  taskId: string,
  data: { title?: string; completed?: boolean },
): Promise<TaskDto | null> {
  await connectMongo();
  if (!Types.ObjectId.isValid(taskId)) return null;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: data },
    { new: true },
  ).lean();

  return task ? toTaskDto(task) : null;
}

// Deletes a task owned by the user.
export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  await connectMongo();
  if (!Types.ObjectId.isValid(taskId)) return false;

  const result = await Task.deleteOne({ _id: taskId, userId });
  return result.deletedCount === 1;
}
