import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getTasksByDate } from "@/lib/services/taskService";
import { searchFootballMatches } from "@/lib/services/footballService";
import { getTodayKey, formatDisplayDate, getHourRange } from "@/lib/utils/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
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

  const [tasks, matchesResult] = await Promise.all([
    getTasksByDate(userId, today),
    loadTodayMatches(today),
  ]);

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100svh-3.5rem)] min-h-0 flex-1 flex-col overflow-hidden sm:-mx-6 lg:h-auto lg:-mx-8 lg:-my-5 lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
        <PageHeader
          title={appContent.dashboard.title}
          subtitle={formatDisplayDate(today)}
          className="mb-2 sm:mb-5"
        />
        <Suspense
          fallback={
            <div className="min-h-0 flex-1 animate-pulse rounded-xl bg-primary/10" />
          }
        >
          <HourlyAgenda date={today} tasks={tasks} hours={hours} />
        </Suspense>
      </div>

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
