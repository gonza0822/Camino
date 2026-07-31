"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCalendarDaySummaryAction } from "@/app/actions/calendar";
import type { CalendarDayMarkerMap, CalendarDaySummary } from "@/features/calendar/types";
import { CalendarLegend, MonthMiniGrid } from "@/features/calendar/components/MonthMiniGrid";
import { CalendarDayModal } from "@/features/calendar/components/CalendarDayModal";
import { cn } from "@/lib/utils/cn";

interface CalendarViewProps {
  year: number;
  todayKey: string;
  markers: CalendarDayMarkerMap;
  initialOpenDate?: string | null;
}

export function CalendarView({ year, todayKey, markers, initialOpenDate = null }: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [highlightDate, setHighlightDate] = useState<string | null>(initialOpenDate);
  const [modalOpen, setModalOpen] = useState(Boolean(initialOpenDate));
  const [modalDate, setModalDate] = useState<string | null>(initialOpenDate);
  const [summary, setSummary] = useState<CalendarDaySummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const syncUrl = useCallback(
    (dateKey: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", String(year));
      if (dateKey) params.set("date", dateKey);
      else params.delete("date");
      const query = params.toString();
      router.replace(query ? `/calendario?${query}` : `/calendario?year=${year}`, { scroll: false });
    },
    [router, searchParams, year],
  );

  const loadDay = useCallback((dateKey: string) => {
    startTransition(async () => {
      const result = await getCalendarDaySummaryAction(dateKey);
      if (result.success) setSummary(result.summary);
      else setSummary(null);
    });
  }, []);

  useEffect(() => {
    if (initialOpenDate) loadDay(initialOpenDate);
  }, [initialOpenDate, loadDay]);

  const openDay = useCallback(
    (dateKey: string) => {
      setHighlightDate(dateKey);
      setModalDate(dateKey);
      setModalOpen(true);
      setSummary(null);
      syncUrl(dateKey);
      loadDay(dateKey);
    },
    [loadDay, syncUrl],
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalDate(null);
    syncUrl(null);
  }, [syncUrl]);

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden">
        <CalendarLegend />
        <div
          className={cn(
            "grid min-h-0 w-full flex-1 content-start gap-3 overflow-y-auto pb-4",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          )}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <MonthMiniGrid
              key={i}
              year={year}
              month={i + 1}
              selectedDate={highlightDate ?? ""}
              todayKey={todayKey}
              markers={markers}
              onSelectDate={openDay}
            />
          ))}
        </div>
      </div>

      <CalendarDayModal
        open={modalOpen}
        date={modalDate}
        summary={summary}
        loading={isPending || (modalOpen && summary === null)}
        onClose={closeModal}
      />
    </>
  );
}
