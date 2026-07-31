export const HOUR_START = 6;
export const HOUR_END = 22;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getTodayKey(): string {
  return toDateKeyInTimeZone(new Date(), "America/Argentina/Buenos_Aires");
}

/** Formats a Date as YYYY-MM-DD in the given IANA timezone. */
export function toDateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Shifts a YYYY-MM-DD key by a number of calendar days. */
export function shiftDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Year and month (1–12) in Argentina timezone. */
export function getArgentinaYearMonth(date = new Date()): { year: number; month: number } {
  const key = toDateKeyInTimeZone(date, "America/Argentina/Buenos_Aires");
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

/** All YYYY-MM-DD keys for a calendar month. */
export function getMonthDateKeys(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const m = String(month).padStart(2, "0");
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return `${year}-${m}-${d}`;
  });
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDateKeys(weekStartKey: string): string[] {
  const start = parseDateKey(weekStartKey);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toDateKey(d);
  });
}

export function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatDisplayDate(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatShortDay(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
}

/** Compact weekday + day number for tight day pickers. */
export function formatDayParts(key: string): { weekday: string; day: string } {
  const date = parseDateKey(key);
  const weekday = date
    .toLocaleDateString("es-AR", { weekday: "short" })
    .replace(/\./g, "")
    .trim();
  return { weekday, day: String(date.getDate()) };
}

export function getHourRange(): number[] {
  return Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
}

export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleDateString("es-AR", { month: "long" });
}

// Returns true when the date key falls in the current Mon–Sun week.
export function isDateInCurrentWeek(dateKey: string): boolean {
  const weekStart = toDateKey(getMonday(new Date()));
  return getWeekDateKeys(weekStart).includes(dateKey);
}

// Maps a kickoff time (HH:mm:ss or HH:mm) into an agenda hour, clamped to the day range.
export function matchTimeToAgendaHour(time: string | null): number {
  if (!time) return Math.max(HOUR_START, Math.min(HOUR_END, 12));

  const [rawHour] = time.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return Math.max(HOUR_START, Math.min(HOUR_END, 12));

  return Math.max(HOUR_START, Math.min(HOUR_END, hour));
}

const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

/** Monday-first weekday labels (short, es-AR). */
export const WEEKDAY_LABELS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

/** Builds a month grid (weeks × 7) with YYYY-MM-DD keys or null for padding cells. */
export function getMonthCalendarGrid(year: number, month: number): (string | null)[][] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const startOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const monthKey = String(month).padStart(2, "0");

  const flat: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) flat.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    flat.push(`${year}-${monthKey}-${String(day).padStart(2, "0")}`);
  }
  while (flat.length % 7 !== 0) flat.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }
  return weeks;
}

/** Formats an instant as HH:mm in Argentina. */
export function formatTimeInArgentina(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("es-AR", {
    timeZone: ARGENTINA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export function formatDisplayDateLong(key: string): string {
  const date = parseDateKey(key);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Normalizes HH:mm or HH:mm:ss into HH:mm:ss for Date parsing. */
function normalizeClock(time: string): string | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? "0");
  if (hour > 23 || minute > 59 || second > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

/**
 * Converts a TheSportsDB UTC kickoff into Argentina date/time for display and agenda.
 * Prefers strTimestamp when present; otherwise dateEvent + strTime as UTC.
 */
export function toArgentinaKickoff(
  dateEvent: string,
  strTime: string | null | undefined,
  strTimestamp?: string | null,
): { date: string; time: string | null } {
  let utc: Date | null = null;

  if (strTimestamp?.trim()) {
    const raw = strTimestamp.trim();
    utc = new Date(raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw) ? raw : `${raw}Z`);
  } else if (strTime?.trim()) {
    const clock = normalizeClock(strTime);
    if (clock && /^\d{4}-\d{2}-\d{2}$/.test(dateEvent)) {
      utc = new Date(`${dateEvent}T${clock}Z`);
    }
  }

  if (!utc || Number.isNaN(utc.getTime())) {
    return { date: dateEvent, time: strTime ? strTime.slice(0, 8) : null };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(utc);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}
