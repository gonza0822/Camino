import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getTasksByDateRange } from "@/lib/services/taskService";
import { getWeeklyGoals } from "@/lib/services/goalService";
import {
  getMonday,
  toDateKey,
  getWeekDateKeys,
  getHourRange,
  parseDateKey,
} from "@/lib/utils/date";
import { PageHeader, Card } from "@/components/ui/PageHeader";
import { WeeklyAgendaGrid } from "@/features/tasks/components/WeeklyAgendaGrid";
import { WeekNavigator } from "@/features/planning/components/PeriodNavigator";
import {
  createWeeklyGoalAction,
  updateWeeklyGoalAction,
  deleteWeeklyGoalAction,
} from "@/app/actions/goals";
import { WeeklyGoalsSection } from "@/features/goals/components/WeeklyGoalsSection";

export const metadata: Metadata = {
  title: appContent.nav.weekly,
};

interface WeeklyPageProps {
  searchParams: Promise<{ week?: string; day?: string }>;
}

export default async function WeeklyPage({ searchParams }: WeeklyPageProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const weekStart =
    params.week ?? toDateKey(getMonday(new Date()));
  const dates = getWeekDateKeys(weekStart);
  const hours = getHourRange();

  const [tasks, goals] = await Promise.all([
    getTasksByDateRange(userId, dates),
    getWeeklyGoals(userId, weekStart),
  ]);

  const weekLabel = `${formatWeekRange(weekStart, dates[6])}`;

  return (
    <>
      <PageHeader title={appContent.weekly.title} subtitle={weekLabel}>
        <Suspense fallback={null}>
          <WeekNavigator weekStart={weekStart} />
        </Suspense>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-primary">
            {appContent.weekly.agendaTitle}
          </h2>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-primary/10" />}>
            <WeeklyAgendaGrid
              weekStart={weekStart}
              dates={dates}
              tasks={tasks}
              hours={hours}
            />
          </Suspense>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-primary">
            {appContent.weekly.goalsTitle}
          </h2>
          <WeeklyGoalsSection
            weekStart={weekStart}
            goals={goals}
            createAction={createWeeklyGoalAction}
            updateAction={updateWeeklyGoalAction}
            deleteAction={deleteWeeklyGoalAction}
          />
        </Card>
      </div>
    </>
  );
}

function formatWeekRange(startKey: string, endKey: string): string {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${start.toLocaleDateString("es-AR", opts)} – ${end.toLocaleDateString("es-AR", opts)}`;
}
