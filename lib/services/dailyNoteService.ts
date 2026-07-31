import { connectMongo } from "@/lib/db/mongodb";
import { DailyNote } from "@/lib/db/models/DailyNote";

export interface DailyNoteDto {
  date: string;
  content: string;
}

// Returns the user's note for a calendar day (empty string if none).
export async function getDailyNote(userId: string, date: string): Promise<DailyNoteDto> {
  await connectMongo();
  const doc = await DailyNote.findOne({ userId, date }).lean();
  return {
    date,
    content: doc?.content ?? "",
  };
}

// Upserts free-form note text for a day.
export async function saveDailyNote(
  userId: string,
  input: { date: string; content: string },
): Promise<DailyNoteDto> {
  await connectMongo();
  const content = input.content.slice(0, 10000);

  const doc = await DailyNote.findOneAndUpdate(
    { userId, date: input.date },
    { $set: { content } },
    { upsert: true, returnDocument: "after" },
  ).lean();

  if (!doc) {
    return { date: input.date, content };
  }

  return { date: doc.date, content: doc.content ?? "" };
}
