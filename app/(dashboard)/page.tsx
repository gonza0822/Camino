import type { Metadata } from "next";
import { Suspense } from "react";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getTasksByDate } from "@/lib/services/taskService";
import { getTodayKey, formatDisplayDate, getHourRange } from "@/lib/utils/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: appContent.nav.dashboard,
};

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const today = getTodayKey();
  const tasks = await getTasksByDate(userId, today);
  const hours = getHourRange();

  return (
    <>
      <PageHeader
        title={appContent.dashboard.title}
        subtitle={formatDisplayDate(today)}
      />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-primary/10" />}>
        <HourlyAgenda date={today} tasks={tasks} hours={hours} />
      </Suspense>
    </>
  );
}
