/** Monday 00:00:00 local for the week containing `ref`. */
export function startOfWeekMonday(ref: Date): Date {
  const d = new Date(ref);
  const day = d.getDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffFromMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Hours from `weekStart` (inclusive) to `instant`. */
export function hoursFromWeekStart(weekStart: Date, instant: Date): number {
  return (instant.getTime() - weekStart.getTime()) / (60 * 60 * 1000);
}

export const HOURS_IN_WEEK = 168;

export type SegmentLayout = { leftPct: number; widthPct: number };

/**
 * Map [start, end) onto 0–168h week window as percentages for absolute positioning.
 */
export function layoutWeekSegment(
  weekStart: Date,
  start: Date,
  end: Date,
  totalHours = HOURS_IN_WEEK,
): SegmentLayout | null {
  const s = hoursFromWeekStart(weekStart, start);
  const e = hoursFromWeekStart(weekStart, end);
  if (e <= 0 || s >= totalHours) return null;
  const clampedStart = Math.max(0, s);
  const clampedEnd = Math.min(totalHours, e);
  const width = clampedEnd - clampedStart;
  if (width <= 0) return null;
  return {
    leftPct: (clampedStart / totalHours) * 100,
    widthPct: Math.max((width / totalHours) * 100, 0.35),
  };
}

export function dayKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDayKeyLocal(dayKey: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Episode intersects calendar day of `dayKey` (local midnight bounds). */
export function episodeTouchesDay(
  episodeStartIso: string,
  episodeEndIso: string,
  dayKey: string,
): boolean {
  const start = new Date(episodeStartIso);
  const end = new Date(episodeEndIso);
  const day = parseDayKeyLocal(dayKey);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  return start < dayEnd && end > dayStart;
}

/** Local midnight for `dayKey` and the following midnight (half-open [start, end)). */
export function dayBoundsLocalMidnight(dayKey: string): {
  start: Date;
  end: Date;
} {
  const [y, mo, d] = dayKey.split("-").map(Number);
  const start = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const end = new Date(y, mo - 1, d + 1, 0, 0, 0, 0);
  return { start, end };
}

/**
 * Map a segment onto one calendar day (0–100% = midnight → midnight local).
 */
export function layoutSegmentInCalendarDay(
  dayKey: string,
  segStart: Date,
  segEnd: Date,
): SegmentLayout | null {
  const { start: dayStart, end: dayEnd } = dayBoundsLocalMidnight(dayKey);
  const ms = dayEnd.getTime() - dayStart.getTime();
  const s = Math.max(segStart.getTime(), dayStart.getTime());
  const e = Math.min(segEnd.getTime(), dayEnd.getTime());
  if (e <= s) return null;
  return {
    leftPct: ((s - dayStart.getTime()) / ms) * 100,
    widthPct: Math.max(((e - s) / ms) * 100, 0.65),
  };
}
