"use client";

import { Suspense } from "react";
import { appContent } from "@/lib/content/app";
import { PageHeader } from "@/components/ui/PageHeader";
import { HourlyAgenda } from "@/features/tasks/components/HourlyAgenda";
import { TodayNotesPanel } from "@/features/notes/components/TodayNotesPanel";
import { TodayNotesMobile } from "@/features/notes/components/TodayNotesMobile";
import { useTodayNotesPanelLayout } from "@/features/notes/hooks/useTodayNotesPanelLayout";
import {
  DEFAULT_TODAY_NOTES_PANEL_LAYOUT,
  TODAY_NOTES_AGENDA_BOTTOM_INSET_PX,
  TODAY_NOTES_AGENDA_LAYOUT_RESERVE_PX,
} from "@/features/notes/notesPanelLayout";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import type { TaskDto } from "@/types/app";

interface TodayDashboardColumnProps {
  date: string;
  displayDate: string;
  tasks: TaskDto[];
  hours: number[];
  noteContent: string;
}

// Left column: agenda + notes (desktop bottom panel / mobile header button + modal).
export function TodayDashboardColumn({
  date,
  displayDate,
  tasks,
  hours,
  noteContent,
}: TodayDashboardColumnProps) {
  const { layout, hydrated, setOpen, setHeight } = useTodayNotesPanelLayout();
  const panelLayout = hydrated ? layout : DEFAULT_TODAY_NOTES_PANEL_LAYOUT;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const agendaBottomReserve = isDesktop ? TODAY_NOTES_AGENDA_LAYOUT_RESERVE_PX : 0;
  const agendaBottomInset = isDesktop ? TODAY_NOTES_AGENDA_BOTTOM_INSET_PX : 0;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
        <PageHeader
          title={appContent.dashboard.title}
          subtitle={displayDate}
          className="mb-2 shrink-0 flex-row items-start justify-between gap-3 sm:mb-5"
        >
          <TodayNotesMobile date={date} initialContent={noteContent} />
        </PageHeader>
        <Suspense
          fallback={
            <div className="min-h-0 flex-1 animate-pulse rounded-xl bg-primary/10" />
          }
        >
          <div className="relative min-h-0 flex-1">
            <div
              className="absolute inset-x-0 top-0 min-h-0"
              style={{ bottom: agendaBottomReserve }}
            >
              <HourlyAgenda
                date={date}
                tasks={tasks}
                hours={hours}
                className="h-full min-h-0"
                bottomInsetPx={agendaBottomInset}
              />
            </div>
          </div>
        </Suspense>
      </div>

      <div className="hidden lg:contents">
        <TodayNotesPanel
          date={date}
          initialContent={noteContent}
          layout={panelLayout}
          onOpenChange={setOpen}
          onHeightChange={setHeight}
        />
      </div>
    </div>
  );
}
