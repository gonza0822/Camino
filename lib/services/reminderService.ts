import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/mongodb";
import { Reminder } from "@/lib/db/models/Reminder";
import type { ReminderDto } from "@/types/app";

function toReminderDto(doc: {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
  sortOrder: number;
}): ReminderDto {
  return {
    id: doc._id.toString(),
    title: doc.title,
    completed: doc.completed,
    sortOrder: doc.sortOrder,
  };
}

// Lists reminders for a user (incomplete first, then by sort order).
export async function listReminders(userId: string): Promise<ReminderDto[]> {
  await connectMongo();
  const docs = await Reminder.find({ userId })
    .sort({ completed: 1, sortOrder: 1, createdAt: 1 })
    .lean();
  return docs.map(toReminderDto);
}

// Creates a reminder at the end of the list.
export async function createReminder(
  userId: string,
  title: string,
): Promise<ReminderDto> {
  await connectMongo();
  const last = await Reminder.findOne({ userId }).sort({ sortOrder: -1 }).lean();
  const sortOrder = (last?.sortOrder ?? 0) + 1;
  const doc = await Reminder.create({
    userId,
    title,
    completed: false,
    sortOrder,
  });
  return toReminderDto(doc);
}

// Updates title and/or completion for a reminder owned by the user.
export async function updateReminder(
  userId: string,
  reminderId: string,
  data: { title?: string; completed?: boolean },
): Promise<ReminderDto | null> {
  await connectMongo();
  if (!Types.ObjectId.isValid(reminderId)) return null;

  const doc = await Reminder.findOneAndUpdate(
    { _id: reminderId, userId },
    { $set: data },
    { returnDocument: "after" },
  ).lean();

  return doc ? toReminderDto(doc) : null;
}

// Deletes a reminder owned by the user.
export async function deleteReminder(
  userId: string,
  reminderId: string,
): Promise<boolean> {
  await connectMongo();
  if (!Types.ObjectId.isValid(reminderId)) return false;
  const result = await Reminder.deleteOne({ _id: reminderId, userId });
  return result.deletedCount === 1;
}
