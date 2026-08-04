"use client";

import { useCallback, useRef, useState } from "react";
import { appContent } from "@/lib/content/app";
import {
  TODAY_NOTES_PANEL_HEADER_PX,
  TODAY_NOTES_PANEL_HEIGHT_MAX,
  TODAY_NOTES_PANEL_HIDE_THRESHOLD,
} from "@/features/notes/notesPanelLayout";
import type { TodayNotesPanelLayout } from "@/features/notes/notesPanelLayout";
import { useAutosavedDailyNote } from "@/features/notes/hooks/useAutosavedDailyNote";
import { cn } from "@/lib/utils/cn";

interface TodayNotesPanelProps {
  date: string;
  initialContent: string;
  layout: TodayNotesPanelLayout;
  onOpenChange: (open: boolean) => void;
  onHeightChange: (height: number) => void;
}

// VS Code–style overlay panel: show/hide by dragging the top resize edge.
export function TodayNotesPanel({
  date,
  initialContent,
  layout,
  onOpenChange,
  onHeightChange,
}: TodayNotesPanelProps) {
  const copy = appContent.dashboard.notes;
  const { content, handleChange, flushSave } = useAutosavedDailyNote(date, initialContent);
  const [isResizing, setIsResizing] = useState(false);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const applyResizeDelta = useCallback(
    (clientY: number) => {
      if (!resizeRef.current) return;
      const delta = resizeRef.current.startY - clientY;
      const next = resizeRef.current.startHeight + delta;
      setPreviewHeight(Math.max(0, next));
      if (!layout.open && next > 24) {
        onOpenChange(true);
      }
    },
    [layout.open, onOpenChange],
  );

  const onResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const startHeight = layout.open ? layout.height : 0;
      resizeRef.current = { startY: event.clientY, startHeight };
      setPreviewHeight(startHeight);
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [layout.height, layout.open],
  );

  const onResizePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      applyResizeDelta(event.clientY);
    },
    [applyResizeDelta],
  );

  const endResize = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!resizeRef.current) return;

      const finalHeight = previewHeight ?? resizeRef.current.startHeight;
      resizeRef.current = null;
      setIsResizing(false);
      setPreviewHeight(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (finalHeight < TODAY_NOTES_PANEL_HIDE_THRESHOLD) {
        onOpenChange(false);
        return;
      }

      onOpenChange(true);
      onHeightChange(finalHeight);
    },
    [onHeightChange, onOpenChange, previewHeight],
  );

  const contentHeight = previewHeight ?? (layout.open ? layout.height : 0);
  const showEditor = layout.open && contentHeight >= TODAY_NOTES_PANEL_HIDE_THRESHOLD;
  const totalHeight = TODAY_NOTES_PANEL_HEADER_PX + (showEditor ? contentHeight : 0);

  const resizeHandle = (
    <button
      type="button"
      aria-label={copy.resizePanel}
      aria-valuemin={TODAY_NOTES_PANEL_HIDE_THRESHOLD}
      aria-valuemax={TODAY_NOTES_PANEL_HEIGHT_MAX}
      aria-valuenow={Math.round(contentHeight)}
      role="slider"
      aria-orientation="vertical"
      onPointerDown={onResizePointerDown}
      onPointerMove={onResizePointerMove}
      onPointerUp={endResize}
      onPointerCancel={endResize}
      className={cn(
        "absolute inset-x-0 top-0 z-10 h-2 cursor-row-resize touch-none",
        "bg-transparent transition-colors duration-150 hover:bg-primary/35",
        isResizing && "bg-primary/45",
      )}
    />
  );

  if (!layout.open && !isResizing) {
    return (
      <div
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 hidden w-full border-t border-border/70 bg-surface/95 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:block"
        style={{ height: TODAY_NOTES_PANEL_HEADER_PX }}
      >
        {resizeHandle}
        <header
          className="flex h-full items-center px-3 sm:px-4"
          style={{ height: TODAY_NOTES_PANEL_HEADER_PX }}
        >
          <span className="text-xs font-semibold text-primary sm:text-sm">{copy.title}</span>
        </header>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "pointer-events-auto absolute inset-x-0 bottom-0 z-20 hidden w-full min-h-0 flex-col lg:flex",
        "border-t border-border/70 bg-surface/95 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-md",
      )}
      style={{ height: Math.max(TODAY_NOTES_PANEL_HEADER_PX, totalHeight) }}
      aria-label={copy.title}
    >
      {resizeHandle}

      <header
        className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-2 sm:px-3"
        style={{ height: TODAY_NOTES_PANEL_HEADER_PX }}
      >
        <span className="truncate text-xs font-semibold text-primary sm:text-sm">{copy.title}</span>
        <button
          type="button"
          aria-label={copy.closePanel}
          onClick={() => onOpenChange(false)}
          className={cn(
            "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md",
            "text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary",
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {showEditor ? (
        <div className="min-h-0 flex-1 px-0 py-2 sm:py-3">
          <textarea
            value={content}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={flushSave}
            placeholder={copy.placeholder}
            maxLength={10000}
            className={cn(
              "h-full min-h-[4.5rem] w-full resize-none rounded-none border-0",
              "bg-background/50 px-3 py-2 text-sm text-foreground outline-none sm:px-4",
              "placeholder:text-muted/70 focus-visible:ring-1 focus-visible:ring-primary/25 focus-visible:ring-inset",
            )}
          />
        </div>
      ) : null}
    </section>
  );
}
