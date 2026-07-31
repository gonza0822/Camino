"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clampNotesPanelHeight,
  DEFAULT_TODAY_NOTES_PANEL_LAYOUT,
  loadTodayNotesPanelLayout,
  saveTodayNotesPanelLayout,
  type TodayNotesPanelLayout,
} from "@/features/notes/notesPanelLayout";

// Panel open state and height with localStorage persistence.
export function useTodayNotesPanelLayout() {
  const [layout, setLayout] = useState<TodayNotesPanelLayout>(DEFAULT_TODAY_NOTES_PANEL_LAYOUT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLayout(loadTodayNotesPanelLayout());
    setHydrated(true);
  }, []);

  const updateLayout = useCallback(
    (updater: (prev: TodayNotesPanelLayout) => TodayNotesPanelLayout) => {
      setLayout((prev) => {
        const next = updater(prev);
        saveTodayNotesPanelLayout(next);
        return next;
      });
    },
    [],
  );

  const setOpen = useCallback(
    (open: boolean) => {
      updateLayout((prev) => ({ ...prev, open }));
    },
    [updateLayout],
  );

  const setHeight = useCallback(
    (height: number) => {
      updateLayout((prev) => ({
        ...prev,
        open: true,
        height: clampNotesPanelHeight(height),
      }));
    },
    [updateLayout],
  );

  return {
    layout,
    hydrated,
    setOpen,
    setHeight,
    updateLayout,
  };
}
