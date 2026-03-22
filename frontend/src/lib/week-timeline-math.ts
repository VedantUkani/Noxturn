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
