export interface WeeklyViewMemory {
  weekStart: string;
  day: string;
}

const STORAGE_KEY = "camino.weeklyView";

// Ensures hard-reload reset runs only once per document lifetime.
let reloadHandled = false;

// True when this document load was a browser refresh (F5 / reload).
function isDocumentReload(): boolean {
  if (typeof performance === "undefined") return false;
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type === "reload";
}

// Returns true only on the first call after a hard reload; later soft mounts get false.
export function consumeHardReloadReset(): boolean {
  if (reloadHandled) return false;
  reloadHandled = true;
  if (!isDocumentReload()) return false;
  clearWeeklyViewMemory();
  return true;
}

// Reads the last weekly day/week for soft navigations in this tab.
export function readWeeklyViewMemory(): WeeklyViewMemory | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WeeklyViewMemory>;
    if (
      typeof parsed.weekStart !== "string" ||
      typeof parsed.day !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parsed.weekStart) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(parsed.day)
    ) {
      return null;
    }
    return { weekStart: parsed.weekStart, day: parsed.day };
  } catch {
    return null;
  }
}

// Persists the weekly view so soft section switches can restore it.
export function writeWeeklyViewMemory(memory: WeeklyViewMemory): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Ignore quota / private mode failures.
  }
}

// Clears remembered week/day (used on hard reload).
export function clearWeeklyViewMemory(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

// Builds /semanal URL from memory, or the bare path when nothing is saved.
export function weeklyHrefFromMemory(memory?: WeeklyViewMemory | null): string {
  const value = memory === undefined ? readWeeklyViewMemory() : memory;
  if (!value) return "/semanal";
  return `/semanal?${new URLSearchParams({
    week: value.weekStart,
    day: value.day,
  }).toString()}`;
}
