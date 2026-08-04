"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { saveDailyNoteAction } from "@/app/actions/dailyNotes";

const SAVE_DEBOUNCE_MS = 900;

// Debounced daily-note editor state that never replaces local text while dirty.
export function useAutosavedDailyNote(date: string, initialContent: string) {
  const [content, setContent] = useState(initialContent);
  const dirtyRef = useRef(false);
  const latestRef = useRef(content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  latestRef.current = content;

  // Reset only when the calendar day changes — not on every server revalidation.
  useEffect(() => {
    setContent(initialContent);
    dirtyRef.current = false;
  }, [date]);

  useEffect(() => {
    if (dirtyRef.current) return;
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const persistNote = useCallback(() => {
    const text = latestRef.current;
    startTransition(async () => {
      const result = await saveDailyNoteAction({ date, content: text });
      if (result.error) return;
      // Keep dirty if the user typed again while this save was in flight.
      if (latestRef.current === text) {
        dirtyRef.current = false;
      }
    });
  }, [date]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      persistNote();
    }, SAVE_DEBOUNCE_MS);
  }, [persistNote]);

  const handleChange = (value: string) => {
    dirtyRef.current = true;
    setContent(value);
    scheduleSave();
  };

  const flushSave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (dirtyRef.current) persistNote();
  };

  return { content, handleChange, flushSave };
}
