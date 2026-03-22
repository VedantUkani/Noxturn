import type {
  CircadianInjuryMapData,
  WeekDayColumn,
  WeekRiskEpisodeVM,
  WeekShiftSegment,
} from "@/lib/week-risk-view-model";
import { dayKeyLocal, startOfWeekMonday } from "@/lib/week-timeline-math";

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function setTime(d: Date, h: number, m = 0): Date {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x;
}

function iso(d: Date): string {
  return d.toISOString();
}

function distributeShiftsByStartDay(
  weekStart: Date,
  shifts: WeekShiftSegment[],
): Map<string, WeekShiftSegment[]> {
  const map = new Map<string, WeekShiftSegment[]>();
  for (let i = 0; i < 7; i++) {
    map.set(dayKeyLocal(addDays(weekStart, i)), []);
  }
  for (const s of shifts) {
    const k = dayKeyLocal(new Date(s.startTime));
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(s);
  }
  return map;
}

function buildDayColumns(
  weekStart: Date,
  shifts: WeekShiftSegment[],
): WeekDayColumn[] {
  const byDay = distributeShiftsByStartDay(weekStart, shifts);
  const days: WeekDayColumn[] = [];
  const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const fmtDate = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });

  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    const key = dayKeyLocal(d);
    const strain = [38, 52, 74, 68, 61, 44, 58][i];
    days.push({
      dayKey: key,
      weekdayLabel: fmtWeekday.format(d),
      dateLabel: fmtDate.format(d),
      dayStrainHint: strain,
      shifts: byDay.get(key) ?? [],
    });
  }
  return days;
}

/**
 * Demo injury map for the ISO week containing `now` (Mon–Sun).
 * Replace with `mapRiskComputeToWeekView` when `/risks/compute` + schedule are wired.
 */
export function buildDemoWeekInjuryMap(now = new Date()): CircadianInjuryMapData {
  const weekStart = startOfWeekMonday(now);
  const m = weekStart;

  const shifts: WeekShiftSegment[] = [
    {
      id: "s-mon-day",
      blockType: "day_shift",
      kind: "shift",
      title: "Clinical days",
      startTime: iso(setTime(m, 7, 30)),
      endTime: iso(setTime(m, 15, 30)),
    },
    {
      id: "s-mon-class",
      blockType: "transition_day",
      kind: "obligation",
      title: "Skills lab",
      startTime: iso(setTime(m, 18, 0)),
      endTime: iso(setTime(m, 20, 0)),
    },
    {
      id: "s-tue-night",
      blockType: "night_shift",
      kind: "shift",
      title: "Night unit",
      startTime: iso(setTime(addDays(m, 1), 19, 0)),
      endTime: iso(setTime(addDays(m, 2), 7, 30)),
    },
    {
      id: "s-wed-day",
      blockType: "day_shift",
      kind: "shift",
      title: "Post-night days",
      startTime: iso(setTime(addDays(m, 2), 8, 0)),
      endTime: iso(setTime(addDays(m, 2), 16, 0)),
    },
    {
      id: "s-thu-eve",
      blockType: "evening_shift",
      kind: "shift",
      title: "Evening clinic",
      startTime: iso(setTime(addDays(m, 3), 14, 0)),
      endTime: iso(setTime(addDays(m, 3), 22, 0)),
    },
    {
      id: "s-fri-night",
      blockType: "night_shift",
      kind: "shift",
      title: "Night float",
      startTime: iso(setTime(addDays(m, 4), 20, 0)),
      endTime: iso(setTime(addDays(m, 5), 8, 0)),
    },
    {
      id: "s-sat-off",
      blockType: "off_day",
      kind: "shift",
      title: "Recovery day",
      startTime: iso(setTime(addDays(m, 5), 10, 0)),
      endTime: iso(setTime(addDays(m, 5), 18, 0)),
    },
    {
      id: "s-sun-short",
      blockType: "day_shift",
      kind: "shift",
      title: "Short day coverage",
      startTime: iso(setTime(addDays(m, 6), 6, 0)),
      endTime: iso(setTime(addDays(m, 6), 13, 0)),
    },
  ];

  const episodes: WeekRiskEpisodeVM[] = [
    {
      id: "e1",
      label: "rapid_flip",
      severity: "high",
      severityScore: 78,
      startTime: iso(setTime(addDays(m, 2), 7, 0)),
      endTime: iso(setTime(addDays(m, 2), 12, 0)),
      headline: "Fast pivot from night exit to daytime demand",
      explanation:
        "Only a thin buffer after night release before your day block starts — circadian alignment is still catching up.",
      recommendationCategory: "sleep",
    },
    {
      id: "e2",
      label: "short_turnaround",
      severity: "high",
      severityScore: 72,
      startTime: iso(setTime(addDays(m, 6), 4, 0)),
      endTime: iso(setTime(addDays(m, 6), 8, 0)),
      headline: "Compressed rest before an early Sunday block",
      explanation:
        "Sleep opportunity after Saturday is shorter than ideal for the next demand window.",
      recommendationCategory: "plan",
    },
    {
      id: "e3",
      label: "low_recovery",
      severity: "moderate",
      severityScore: 55,
      startTime: iso(setTime(addDays(m, 3), 11, 0)),
      endTime: iso(setTime(addDays(m, 3), 17, 0)),
      headline: "Mid-week recovery gap",
      explanation:
        "Workload stacking leaves little room for protected rest between obligations.",
      recommendationCategory: "rest",
    },
    {
      id: "e4",
      label: "unsafe_drive",
      severity: "critical",
      severityScore: 88,
      startTime: iso(setTime(addDays(m, 2), 6, 30)),
      endTime: iso(setTime(addDays(m, 2), 7, 45)),
      headline: "Drive home after night — elevated drowsy risk",
      explanation:
        "Chronotype is still in sleep pressure after night work; commute timing sits in a high-risk window.",
      recommendationCategory: "commute",
    },
    {
      id: "e5",
      label: "repeated_nights_no_reset",
      severity: "moderate",
      severityScore: 62,
      startTime: iso(setTime(addDays(m, 4), 18, 0)),
      endTime: iso(setTime(addDays(m, 6), 10, 0)),
      headline: "Back-to-back night pattern without a full reset day",
      explanation:
        "Two night blocks in one week with limited anchor sleep between them.",
      recommendationCategory: "sleep",
    },
    {
      id: "e6",
      label: "missed_anchor_sleep",
      severity: "moderate",
      severityScore: 58,
      startTime: iso(setTime(addDays(m, 5), 14, 0)),
      endTime: iso(setTime(addDays(m, 5), 22, 0)),
      headline: "Protected sleep window likely interrupted",
      explanation:
        "Light exposure and social load on the recovery day compete with the main sleep anchor.",
      recommendationCategory: "sleep",
    },
    {
      id: "e7",
      label: "wearable_recovery_deficit",
      severity: "moderate",
      severityScore: 51,
      startTime: iso(setTime(addDays(m, 2), 0, 0)),
      endTime: iso(setTime(addDays(m, 3), 23, 59)),
      headline: "Wrist data suggests shallow recovery vs plan",
      explanation:
        "HRV and restlessness imply less physiological recovery than the schedule assumed.",
      recommendationCategory: "wearable",
    },
    {
      id: "e8",
      label: "isolation_low_opportunity",
      severity: "low",
      severityScore: 34,
      startTime: iso(setTime(addDays(m, 5), 12, 0)),
      endTime: iso(setTime(addDays(m, 5), 20, 0)),
      headline: "Sparse social recovery touchpoints",
      explanation:
        "Long solo stretches around rest days reduce co-regulation opportunities that help downshift stress.",
      recommendationCategory: "social",
    },
  ];

  const circadianStrainScore = 67;
  const summaryLine =
    "This week stacks nights against quick day returns — the injury is in the schedule transitions, not in how hard you’re trying.";

  const topSorted = [...episodes].sort(
    (a, b) => b.severityScore - a.severityScore,
  );
  const topRisks = topSorted.slice(0, 3).map((e) => ({
    label: e.label,
    severity: e.severity,
    headline: e.headline,
    detail: e.explanation,
  }));

  const fmtRange = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const endWeek = addDays(weekStart, 6);
  const weekLabel = `${fmtRange.format(weekStart)} – ${fmtRange.format(endWeek)}`;

  return {
    weekLabel,
    weekStartDayKey: dayKeyLocal(weekStart),
    circadianStrainScore,
    summaryLine,
    topRisks,
    days: buildDayColumns(weekStart, shifts),
    episodes,
  };
}
