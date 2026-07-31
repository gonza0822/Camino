export interface CalendarDayMarker {
  date: string;
  taskCount: number;
  completedCount: number;
  hasNote: boolean;
}

export type CalendarDayMarkerMap = Record<string, CalendarDayMarker>;

export interface CalendarDayTask {
  id: string;
  hour: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface CalendarDaySummary {
  date: string;
  tasks: CalendarDayTask[];
  noteContent: string;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}
