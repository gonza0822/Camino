export const TODAY_NOTES_PANEL_HEADER_PX = 36;
/** Extra space so the last agenda row clears the collapsed notes strip. */
export const TODAY_NOTES_AGENDA_BOTTOM_GAP_PX = 10;
export const TODAY_NOTES_AGENDA_BOTTOM_INSET_PX =
  TODAY_NOTES_PANEL_HEADER_PX + TODAY_NOTES_AGENDA_BOTTOM_GAP_PX;
/** Fixed agenda column bottom reserve (collapsed strip only — panel expand uses overlay). */
export const TODAY_NOTES_AGENDA_LAYOUT_RESERVE_PX = TODAY_NOTES_AGENDA_BOTTOM_INSET_PX;
export const TODAY_NOTES_PANEL_HEIGHT_MIN = 100;
export const TODAY_NOTES_PANEL_HEIGHT_MAX = 560;
export const TODAY_NOTES_PANEL_HEIGHT_DEFAULT = 220;
/** Below this content height (px), the panel hides on release (drag down). */
export const TODAY_NOTES_PANEL_HIDE_THRESHOLD = 72;

export interface TodayNotesPanelLayout {
  open: boolean;
  height: number;
}

const STORAGE_KEY = "camino-today-notes-panel";

export const DEFAULT_TODAY_NOTES_PANEL_LAYOUT: TodayNotesPanelLayout = {
  open: true,
  height: TODAY_NOTES_PANEL_HEIGHT_DEFAULT,
};

function clampHeight(value: number): number {
  return Math.min(
    TODAY_NOTES_PANEL_HEIGHT_MAX,
    Math.max(TODAY_NOTES_PANEL_HEIGHT_MIN, Math.round(value)),
  );
}

// Reads panel chrome state from localStorage (client only).
export function loadTodayNotesPanelLayout(): TodayNotesPanelLayout {
  if (typeof window === "undefined") {
    return DEFAULT_TODAY_NOTES_PANEL_LAYOUT;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TODAY_NOTES_PANEL_LAYOUT;

    const parsed = JSON.parse(raw) as Partial<TodayNotesPanelLayout> & { mode?: string };

    const height =
      typeof parsed.height === "number" && Number.isFinite(parsed.height)
        ? clampHeight(parsed.height)
        : DEFAULT_TODAY_NOTES_PANEL_LAYOUT.height;

    const open =
      parsed.open === false || parsed.mode === "collapsed" ? false : true;

    return { open, height };
  } catch {
    return DEFAULT_TODAY_NOTES_PANEL_LAYOUT;
  }
}

export function saveTodayNotesPanelLayout(layout: TodayNotesPanelLayout): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    /* ignore */
  }
}

export function clampNotesPanelHeight(value: number): number {
  return clampHeight(value);
}

/** Total height (px) of the notes strip overlaid on the agenda column. */
export function getTodayNotesOverlayHeight(layout: TodayNotesPanelLayout): number {
  if (!layout.open) return TODAY_NOTES_PANEL_HEADER_PX;
  return TODAY_NOTES_PANEL_HEADER_PX + layout.height;
}
