import { connectMongo } from "@/lib/db/mongodb";
import { Task } from "@/lib/db/models/Task";
import { DailyNote } from "@/lib/db/models/DailyNote";
import type {
  CalendarDayMarkerMap,
  CalendarDaySummary,
  CalendarDayTask,
} from "@/features/calendar/types";

function yearDateBounds(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

// Aggregates per-day task counts and note flags for a calendar year.
export async function getYearCalendarMarkers(
  userId: string,
  year: number,
): Promise<CalendarDayMarkerMap> {
  await connectMongo();
  const { start, end } = yearDateBounds(year);

  const [taskRows, noteRows] = await Promise.all([
    Task.aggregate<{ _id: string; total: number; completed: number }>([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end },
          title: { $type: "string", $regex: /\S/ },
        },
      },
      {
        $group: {
          _id: "$date",
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$completed", 1, 0] } },
        },
      },
    ]),
    DailyNote.find({
      userId,
      date: { $gte: start, $lte: end },
      content: { $regex: /\S/ },
    })
      .select("date")
      .lean(),
  ]);

  const map: CalendarDayMarkerMap = {};

  for (const row of taskRows) {
    map[row._id] = {
      date: row._id,
      taskCount: row.total,
      completedCount: row.completed,
      hasNote: false,
    };
  }

  for (const note of noteRows) {
    const existing = map[note.date];
    if (existing) {
      existing.hasNote = true;
    } else {
      map[note.date] = {
        date: note.date,
        taskCount: 0,
        completedCount: 0,
        hasNote: true,
      };
    }
  }

  return map;
}

// Loads tasks and the daily note for the calendar day detail panel.
export async function getCalendarDaySummary(
  userId: string,
  date: string,
): Promise<CalendarDaySummary> {
  await connectMongo();

  const [tasks, note] = await Promise.all([
    Task.find({ userId, date, title: { $regex: /\S/ } })
      .sort({ hour: 1 })
      .lean(),
    DailyNote.findOne({ userId, date }).lean(),
  ]);

  const mapped: CalendarDayTask[] = tasks.map((doc) => ({
    id: doc._id.toString(),
    hour: doc.hour,
    title: doc.title,
    completed: doc.completed,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
  }));

  const completed = mapped.filter((t) => t.completed).length;

  return {
    date,
    tasks: mapped,
    noteContent: note?.content?.trim() ?? "",
    stats: {
      total: mapped.length,
      completed,
      pending: mapped.length - completed,
    },
  };
}
