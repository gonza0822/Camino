import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getTasksByDate } from "@/lib/services/taskService";
import { getDailyNote } from "@/lib/services/dailyNoteService";
import { searchFootballMatches } from "@/lib/services/footballService";
import { getTodayKey, formatDisplayDate, getHourRange } from "@/lib/utils/date";
import { TodayDashboardColumn } from "@/features/notes/components/TodayDashboardColumn";
import { TodayMatchesSidebar } from "@/features/football/components/TodayMatchesSidebar";
import type { FootballMatchDto } from "@/types/football";

export const metadata: Metadata = {
  title: appContent.nav.dashboard,
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const today = getTodayKey();
  const hours = getHourRange();

  const [tasks, note, matchesResult] = await Promise.all([
    getTasksByDate(userId, today),
    getDailyNote(userId, today),
    loadTodayMatches(today),
  ]);

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100svh-3.5rem)] min-h-0 flex-1 flex-col overflow-hidden sm:-mx-6 lg:h-auto lg:-mx-8 lg:-my-5 lg:flex-row">
      <TodayDashboardColumn
        date={today}
        displayDate={formatDisplayDate(today)}
        tasks={tasks}
        hours={hours}
        noteContent={note.content}
      />

      <TodayMatchesSidebar
        matches={matchesResult.matches}
        fetchError={matchesResult.error}
      />
    </div>
  );
}

// Loads today's soccer fixtures; failures should not block the agenda.
async function loadTodayMatches(
  date: string,
): Promise<{ matches: FootballMatchDto[]; error: boolean }> {
  try {
    const matches = await searchFootballMatches({ date, scope: "next" });
    return { matches, error: false };
  } catch {
    return { matches: [], error: true };
  }
}
