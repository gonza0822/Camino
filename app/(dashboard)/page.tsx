import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getTasksByDate } from "@/lib/services/taskService";
import { getDailyNote } from "@/lib/services/dailyNoteService";
import { listReminders } from "@/lib/services/reminderService";
import { getTodayKey, formatDisplayDate, getHourRange } from "@/lib/utils/date";
import { TodayDashboardColumn } from "@/features/notes/components/TodayDashboardColumn";
import { TodayMatchesPanel } from "@/features/football/components/TodayMatchesPanel";
import { TodayReminders } from "@/features/reminders/components/TodayReminders";

export const metadata: Metadata = {
  title: appContent.nav.dashboard,
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const today = getTodayKey();
  const hours = getHourRange();

  const [tasks, note, reminders] = await Promise.all([
    getTasksByDate(userId, today),
    getDailyNote(userId, today),
    listReminders(userId),
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

      <Suspense
        fallback={
          <aside className="flex h-[30vh] w-full shrink-0 flex-col self-stretch overflow-hidden border-t border-border/70 bg-surface p-4 lg:h-full lg:w-80 lg:border-l lg:border-t-0">
            <div className="mb-3 h-5 w-32 animate-pulse rounded bg-primary/15" />
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-lg bg-primary/10" />
              <div className="h-16 animate-pulse rounded-lg bg-primary/10" />
            </div>
          </aside>
        }
      >
        <TodayMatchesPanel date={today} />
      </Suspense>

      <TodayReminders initialReminders={reminders} />
    </div>
  );
}
