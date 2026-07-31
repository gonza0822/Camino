import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { appContent } from "@/lib/content/app";
import { getSessionUserId } from "@/lib/auth/session";
import { getYearCalendarMarkers } from "@/lib/services/calendarService";
import { getArgentinaYearMonth, getTodayKey, isValidDateKey } from "@/lib/utils/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import { YearNavigator } from "@/features/calendar/components/YearNavigator";

export const metadata: Metadata = {
  title: appContent.nav.calendar,
  description: appContent.calendar.subtitle,
  robots: { index: false, follow: false },
};

interface CalendarPageProps {
  searchParams: Promise<{ year?: string; date?: string }>;
}

function parseYear(raw: string | undefined): number {
  const { year: currentYear } = getArgentinaYearMonth();
  if (!raw) return currentYear;
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1970 || year > 2100) return currentYear;
  return year;
}

function parseInitialOpenDate(
  raw: string | undefined,
  year: number,
): string | null {
  if (!raw || !isValidDateKey(raw) || !raw.startsWith(String(year))) return null;
  return raw;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const todayKey = getTodayKey();
  const year = parseYear(params.year);
  const initialOpenDate = parseInitialOpenDate(params.date, year);

  const markers = await getYearCalendarMarkers(userId, year);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <PageHeader
        title={appContent.calendar.title}
        subtitle={`${appContent.calendar.subtitle} · ${year}`}
        className="mb-3 shrink-0 sm:mb-4"
      >
        <Suspense fallback={null}>
          <YearNavigator year={year} />
        </Suspense>
      </PageHeader>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-primary/10" />}>
        <CalendarView
          year={year}
          todayKey={todayKey}
          markers={markers}
          initialOpenDate={initialOpenDate}
        />
      </Suspense>
    </div>
  );
}
