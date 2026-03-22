# Week page (`/week`) — source reference

Circadian injury map: strain snapshot, weekly timeline (shifts + risk bands), day detail panel, and top dangers. Data is **mock** via `buildDemoWeekInjuryMap()` until the API adapter is wired.

**Route:** `src/app/(dashboard)/week/page.tsx` → `WeekPageContent`.

**Shared types:** `Severity`, `BlockType`, `RiskComputeResponse`, `ScheduleBlockInput` from `src/lib/types.ts` (not duplicated below).

---

## File map

| Path | Role |
|------|------|
| `src/app/(dashboard)/week/page.tsx` | App Router entry |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell (`AppShell`) wrapping `/week` |
| `src/lib/navigation.ts` | `/week` nav item + top bar title |
| `src/components/features/week/WeekPageContent.tsx` | Page layout, state, composition |
| `src/components/week/index.ts` | Barrel exports |
| `src/lib/week-risk-view-model.ts` | View-model types |
| `src/lib/week-timeline-math.ts` | Week window math, segment layout |
| `src/lib/mocks/week-injury-map-mock.ts` | Demo `CircadianInjuryMapData` |
| `src/lib/adapters/week-risk-map-adapter.ts` | `POST /risks/compute` → view model |
| `src/components/week/WeeklyRiskSummary.tsx` | Strain score card |
| `src/components/week/WeeklyTimeline.tsx` | Day strip + shift/risk tracks |
| `src/components/week/ShiftBlock.tsx` | Positioned shift bar |
| `src/components/week/RiskOverlay.tsx` | Positioned risk band |
| `src/components/week/DayContextPanel.tsx` | Selected day + episodes |
| `src/components/week/WeeklyTopDangers.tsx` | “What to avoid” section |
| `src/components/week/WeekDangerCard.tsx` | Danger tile |
| `src/components/week/week-risk-meta.ts` | Labels, colors |
| `src/components/week/ObligationBlock.tsx` | Wrapper (optional) |
| `src/components/week/RiskEpisodeCard.tsx` | Standalone episode card (exported; not used on page) |
| `src/components/features/today-plan/WhatToAvoidSection.tsx` | Framed section shell (shared with Today) |
| `src/components/features/today-plan/today-surfaces.ts` | `todayCardShell`, `todayAvoidanceGridClass`, … |

---

## `src/app/(dashboard)/week/page.tsx`

```tsx
import { WeekPageContent } from "@/components/features/week/WeekPageContent";

export default function WeekPage() {
  return <WeekPageContent />;
}
```

---

## `src/components/features/week/WeekPageContent.tsx`

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDemoWeekInjuryMap } from "@/lib/mocks/week-injury-map-mock";
import { episodeTouchesDay } from "@/lib/week-timeline-math";
import { WeeklyRiskSummary } from "@/components/week/WeeklyRiskSummary";
import { WeeklyTopDangers } from "@/components/week/WeeklyTopDangers";
import { WeeklyTimeline } from "@/components/week/WeeklyTimeline";
import { DayContextPanel } from "@/components/week/DayContextPanel";

function weekStartDateFromKey(weekStartDayKey: string): Date {
  const [y, m, d] = weekStartDayKey.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function WeekPageContent() {
  const data = useMemo(() => buildDemoWeekInjuryMap(), []);
  const weekStart = useMemo(
    () => weekStartDateFromKey(data.weekStartDayKey),
    [data.weekStartDayKey],
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (data.days.length === 0) return;
    if (selectedDayKey === null) {
      setSelectedDayKey(data.days[0]!.dayKey);
    }
  }, [data.days, selectedDayKey]);

  const selectedDayColumn = useMemo(
    () => data.days.find((d) => d.dayKey === selectedDayKey) ?? null,
    [data.days, selectedDayKey],
  );

  const episodesForDay = useMemo(() => {
    if (!selectedDayKey) return [];
    return data.episodes.filter((e) =>
      episodeTouchesDay(e.startTime, e.endTime, selectedDayKey),
    );
  }, [data.episodes, selectedDayKey]);

  useEffect(() => {
    if (!selectedDayKey) return;
    const inDay = data.episodes.filter((e) =>
      episodeTouchesDay(e.startTime, e.endTime, selectedDayKey),
    );
    setSelectedEpisodeId((prev) => {
      if (prev && inDay.some((e) => e.id === prev)) return prev;
      return inDay[0]?.id ?? null;
    });
  }, [selectedDayKey, data.episodes]);

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16 md:space-y-16 md:pb-20">
      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Week overview
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-[1.75rem] sm:leading-tight">
          Circadian injury map
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-slate-400">
          One read of how your rota stresses recovery — then use{" "}
          <span className="font-medium text-slate-300">Today</span> for actions.
        </p>
      </header>

      <section aria-labelledby="week-strain-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="week-strain-heading"
            className="text-base font-semibold text-slate-100"
          >
            Strain snapshot
          </h2>
        </div>
        <WeeklyRiskSummary data={data} />
      </section>

      <section
        aria-labelledby="week-schedule-heading"
        className="space-y-6 rounded-2xl bg-slate-950/25 p-5 ring-1 ring-white/[0.06] sm:p-6 md:p-8 md:space-y-8"
      >
        <div className="space-y-2">
          <h2
            id="week-schedule-heading"
            className="text-base font-semibold tracking-tight text-slate-100"
          >
            Schedule & risks
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-slate-500">
            Pick a day, or tap a risk band. Top = shifts; bottom = where strain
            spikes.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              Week strip
            </p>
            <WeeklyTimeline
              variant="embedded"
              data={data}
              weekStart={weekStart}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
              selectedEpisodeId={selectedEpisodeId}
              onSelectEpisode={setSelectedEpisodeId}
            />
          </div>

          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[min(100%,320px)]">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 lg:mt-0">
              Day detail
            </p>
            <DayContextPanel
              day={selectedDayColumn}
              episodesForDay={episodesForDay}
              onPickEpisode={setSelectedEpisodeId}
              selectedEpisodeId={selectedEpisodeId}
            />
          </aside>
        </div>
      </section>

      <section aria-labelledby="week-avoid-heading" className="space-y-4">
        <h2
          id="week-avoid-heading"
          className="text-base font-semibold text-slate-100"
        >
          What to ease up on
        </h2>
        <p className="-mt-1 max-w-lg text-sm text-slate-500">
          The three highest-impact schedule pressures this week.
        </p>
        <WeeklyTopDangers data={data} />
      </section>
    </div>
  );
}
```

---

## `src/components/week/index.ts`

```tsx
export { WeeklyRiskSummary } from "./WeeklyRiskSummary";
export { WeeklyTopDangers } from "./WeeklyTopDangers";
export { WeekDangerCard } from "./WeekDangerCard";
export { WeeklyTimeline } from "./WeeklyTimeline";
export { ShiftBlock } from "./ShiftBlock";
export { ObligationBlock } from "./ObligationBlock";
export { RiskOverlay } from "./RiskOverlay";
export { RiskEpisodeCard } from "./RiskEpisodeCard";
export { DayContextPanel } from "./DayContextPanel";
```

---

## `src/lib/week-risk-view-model.ts`

```ts
/**
 * View model for the Circadian Injury Map (Week screen).
 * Aligned with backend risk concepts where possible; extended labels cover UX
 * until all are emitted by `/risks/compute`.
 */

import type { BlockType } from "@/lib/types";
import type { Severity } from "@/lib/types";

/** Superset of backend `RiskLabel` + forward-looking episode types for UI / mock. */
export type WeekRiskLabel =
  | "rapid_flip"
  | "short_turnaround"
  | "low_recovery"
  | "unsafe_drive"
  | "repeated_nights_no_reset"
  | "missed_anchor_sleep"
  | "wearable_recovery_deficit"
  | "isolation_low_opportunity";

export type RecommendationCategory =
  | "sleep"
  | "light"
  | "caffeine"
  | "commute"
  | "social"
  | "rest"
  | "movement"
  | "wearable"
  | "plan";

export type WeekShiftSegment = {
  id: string;
  blockType: BlockType;
  /** Work shift vs class / family / fixed obligation */
  kind: "shift" | "obligation";
  title: string;
  startTime: string;
  endTime: string;
};

export type WeekRiskEpisodeVM = {
  id: string;
  label: WeekRiskLabel;
  severity: Severity;
  severityScore: number;
  startTime: string;
  endTime: string;
  headline: string;
  explanation: string;
  recommendationCategory: RecommendationCategory;
};

export type WeekDayColumn = {
  /** YYYY-MM-DD local */
  dayKey: string;
  weekdayLabel: string;
  dateLabel: string;
  /** Strain hint for this calendar day (0–100), optional */
  dayStrainHint?: number;
  shifts: WeekShiftSegment[];
};

export type CircadianInjuryMapData = {
  weekLabel: string;
  weekStartDayKey: string;
  circadianStrainScore: number;
  summaryLine: string;
  topRisks: {
    label: WeekRiskLabel;
    severity: Severity;
    headline: string;
    /** Short rationale — same role as avoidance `detail` on Today. */
    detail: string;
  }[];
  days: WeekDayColumn[];
  episodes: WeekRiskEpisodeVM[];
};
```

---

## `src/lib/week-timeline-math.ts`

```ts
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
```

---

## `src/lib/mocks/week-injury-map-mock.ts`

```ts
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
```

---

## `src/lib/adapters/week-risk-map-adapter.ts`

```ts
/**
 * Maps backend `/risks/compute` payloads into the Week screen view model.
 * Use when schedule blocks + risk response are available; until then the Week
 * page uses `buildDemoWeekInjuryMap`.
 */

import type { RiskComputeResponse } from "@/lib/types";
import type { ScheduleBlockInput } from "@/lib/types";
import type {
  CircadianInjuryMapData,
  WeekRiskEpisodeVM,
  WeekRiskLabel,
  WeekShiftSegment,
} from "@/lib/week-risk-view-model";
import {
  dayKeyLocal,
  startOfWeekMonday,
} from "@/lib/week-timeline-math";

const LABEL_MAP: Record<string, WeekRiskLabel> = {
  rapid_flip: "rapid_flip",
  short_turnaround: "short_turnaround",
  low_recovery: "low_recovery",
  unsafe_drive: "unsafe_drive",
};

function normalizeLabel(raw: string): WeekRiskLabel {
  if (raw in LABEL_MAP) return LABEL_MAP[raw]!;
  return "low_recovery";
}

function explanationText(explanation?: Record<string, unknown>): string {
  if (!explanation) return "";
  const m = explanation.message;
  if (typeof m === "string") return m;
  return "";
}

/**
 * Convert a single API risk episode to the week VM shape (for lists / detail).
 */
export function mapApiRiskEpisodeToVm(
  ep: RiskComputeResponse["risk_episodes"][number],
  index: number,
): WeekRiskEpisodeVM {
  const label = normalizeLabel(String(ep.label));
  const startTime =
    typeof ep.start_time === "string"
      ? ep.start_time
      : new Date(ep.start_time as unknown as string).toISOString();
  const endTime =
    typeof ep.end_time === "string"
      ? ep.end_time
      : new Date(ep.end_time as unknown as string).toISOString();

  return {
    id: ep.id != null ? String(ep.id) : `api-${index}`,
    label,
    severity: ep.severity,
    severityScore: ep.severity_score ?? 50,
    startTime,
    endTime,
    headline: explanationText(ep.explanation) || `${label.replace(/_/g, " ")}`,
    explanation:
      explanationText(ep.explanation) ||
      "Schedule-driven strain — see Today for the next protective step.",
    recommendationCategory: "plan",
  };
}

function blocksToShiftSegments(blocks: ScheduleBlockInput[]): WeekShiftSegment[] {
  return blocks.map((b, i) => ({
    id: b.id ?? `block-${i}`,
    blockType: b.block_type,
    kind: "shift" as const,
    title: b.title?.trim() || b.block_type.replace(/_/g, " "),
    startTime: b.start_time,
    endTime: b.end_time,
  }));
}

function buildDayColumnsFromShifts(
  weekStart: Date,
  shifts: WeekShiftSegment[],
): import("@/lib/week-risk-view-model").WeekDayColumn[] {
  const byDay = new Map<string, WeekShiftSegment[]>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    byDay.set(dayKeyLocal(d), []);
  }
  for (const s of shifts) {
    const k = dayKeyLocal(new Date(s.startTime));
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(s);
  }
  const fmtWeekday = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const fmtDate = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const days: import("@/lib/week-risk-view-model").WeekDayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = dayKeyLocal(d);
    days.push({
      dayKey: key,
      weekdayLabel: fmtWeekday.format(d),
      dateLabel: fmtDate.format(d),
      shifts: byDay.get(key) ?? [],
    });
  }
  return days;
}

/**
 * Full merge from API risk compute + schedule blocks (same week as `blocks`).
 * Episodes are mapped to VM; top risks derived from severity score.
 */
export function mapRiskComputeToWeekView(
  res: RiskComputeResponse,
  blocks: ScheduleBlockInput[],
  weekRef = new Date(),
): CircadianInjuryMapData {
  const weekStart = startOfWeekMonday(weekRef);
  const shifts = blocksToShiftSegments(blocks);
  const episodes = res.risk_episodes.map(mapApiRiskEpisodeToVm);
  const sorted = [...episodes].sort((a, b) => b.severityScore - a.severityScore);
  const topRisks = sorted.slice(0, 3).map((e) => ({
    label: e.label,
    severity: e.severity,
    headline: e.headline,
    detail: e.explanation,
  }));

  const fmtRange = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);

  return {
    weekLabel: `${fmtRange.format(weekStart)} – ${fmtRange.format(end)}`,
    weekStartDayKey: dayKeyLocal(weekStart),
    circadianStrainScore: Math.round(res.circadian_strain_score),
    summaryLine: res.summary,
    topRisks,
    days: buildDayColumnsFromShifts(weekStart, shifts),
    episodes,
  };
}
```

---

## `src/components/week/WeeklyRiskSummary.tsx`

```tsx
"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { strainScoreHue } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type WeeklyRiskSummaryProps = {
  data: Pick<
    CircadianInjuryMapData,
    "circadianStrainScore" | "summaryLine" | "weekLabel"
  >;
  className?: string;
};

export function WeeklyRiskSummary({ data, className }: WeeklyRiskSummaryProps) {
  const score = data.circadianStrainScore;

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-slate-900/50 to-[#0a1020]/80 p-6 ring-1 ring-white/[0.07] sm:p-8",
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {data.weekLabel}
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <span
          className={cn(
            "text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl",
            strainScoreHue(score),
          )}
        >
          {score}
        </span>
        <span className="pb-1.5 text-sm font-medium text-slate-500">/ 100</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Circadian strain index</p>
      <p className="mt-5 max-w-xl text-[15px] leading-[1.65] text-slate-400">
        {data.summaryLine}
      </p>
    </div>
  );
}
```

---

## `src/components/week/WeeklyTimeline.tsx`

```tsx
"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { HOURS_IN_WEEK, layoutWeekSegment } from "@/lib/week-timeline-math";
import { ShiftBlock } from "./ShiftBlock";
import { RiskOverlay } from "./RiskOverlay";
import { cn } from "@/lib/utils";

type WeeklyTimelineProps = {
  data: CircadianInjuryMapData;
  weekStart: Date;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  selectedEpisodeId: string | null;
  onSelectEpisode: (id: string) => void;
  /** Lighter chrome when nested inside a parent page section. */
  variant?: "standalone" | "embedded";
  className?: string;
};

export function WeeklyTimeline({
  data,
  weekStart,
  selectedDayKey,
  onSelectDay,
  selectedEpisodeId,
  onSelectEpisode,
  variant = "standalone",
  className,
}: WeeklyTimelineProps) {
  const shifts = data.days.flatMap((d) => d.shifts);
  const uniqueShifts = Array.from(new Map(shifts.map((s) => [s.id, s])).values());

  const shell =
    variant === "embedded"
      ? "overflow-hidden rounded-xl bg-[#080d14]/90 ring-1 ring-white/[0.06]"
      : "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070b14]/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  return (
    <div className={cn(shell, className)}>
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-slate-950/40">
        {data.days.map((d) => {
          const active = selectedDayKey === d.dayKey;
          return (
            <button
              key={d.dayKey}
              type="button"
              onClick={() => onSelectDay(d.dayKey)}
              className={cn(
                "min-h-[3.25rem] border-l border-white/[0.04] px-1 py-3 text-center transition-colors first:border-l-0 sm:min-h-[3.5rem]",
                active
                  ? "bg-teal-500/[0.1] text-teal-50 ring-inset ring-1 ring-teal-400/20"
                  : "text-slate-300 hover:bg-white/[0.04]",
              )}
            >
              <div className="text-[11px] font-semibold tracking-tight sm:text-xs">
                {d.weekdayLabel}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">{d.dateLabel}</div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5 sm:px-5">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 grid grid-cols-7 opacity-30"
            aria-hidden
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "border-l border-teal-400/[0.06]",
                  i === 0 && "border-l-0",
                )}
              />
            ))}
          </div>

          <div className="relative h-28 w-full sm:h-32">
            {uniqueShifts.map((seg) => {
              const layout = layoutWeekSegment(
                weekStart,
                new Date(seg.startTime),
                new Date(seg.endTime),
                HOURS_IN_WEEK,
              );
              if (!layout) return null;
              return (
                <ShiftBlock key={seg.id} segment={seg} layout={layout} />
              );
            })}
          </div>

          <div className="relative mt-3 h-14 w-full border-t border-white/[0.05] pt-3 sm:h-[4.5rem]">
            {data.episodes.map((ep) => {
              const layout = layoutWeekSegment(
                weekStart,
                new Date(ep.startTime),
                new Date(ep.endTime),
                HOURS_IN_WEEK,
              );
              if (!layout) return null;
              return (
                <RiskOverlay
                  key={ep.id}
                  episode={ep}
                  layout={layout}
                  selected={selectedEpisodeId === ep.id}
                  onSelect={onSelectEpisode}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.05] pt-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-teal-400/30 bg-teal-950/50" />
            Day / evening
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-indigo-400/30 bg-indigo-950/55" />
            Night
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-violet-400/35 bg-violet-950/50" />
            Class / fixed
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-amber-400/35 bg-amber-500/15" />
            Risk
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## `src/components/week/ShiftBlock.tsx`

```tsx
"use client";

import type { WeekShiftSegment } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { blockTypeClasses } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type ShiftBlockProps = {
  segment: WeekShiftSegment;
  layout: SegmentLayout;
  className?: string;
};

function fmtRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const t = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${t.format(a)}–${t.format(b)}`;
  } catch {
    return "";
  }
}

export function ShiftBlock({ segment, layout, className }: ShiftBlockProps) {
  return (
    <div
      className={cn(
        "absolute top-1 bottom-1 flex min-w-0 flex-col justify-center overflow-hidden rounded-md px-1.5 py-0.5 text-[10px] leading-tight shadow-sm",
        blockTypeClasses(segment.blockType, segment.kind),
        className,
      )}
      style={{
        left: `${layout.leftPct}%`,
        width: `${layout.widthPct}%`,
      }}
      title={`${segment.title} · ${fmtRange(segment.startTime, segment.endTime)}`}
    >
      <span className="truncate font-semibold tracking-tight">
        {segment.title}
      </span>
      <span className="truncate opacity-80">
        {fmtRange(segment.startTime, segment.endTime)}
      </span>
    </div>
  );
}
```

---

## `src/components/week/RiskOverlay.tsx`

```tsx
"use client";

import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { severityAccent, WEEK_RISK_TITLES } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type RiskOverlayProps = {
  episode: WeekRiskEpisodeVM;
  layout: SegmentLayout;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function RiskOverlay({
  episode,
  layout,
  selected,
  onSelect,
}: RiskOverlayProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(episode.id)}
      className={cn(
        "absolute top-0.5 bottom-0.5 cursor-pointer rounded border px-1 text-left text-[9px] font-medium leading-tight transition-[box-shadow,transform] hover:z-10 hover:ring-1 hover:ring-teal-400/40",
        severityAccent(episode.severity),
        selected && "z-20 ring-2 ring-teal-300/50",
      )}
      style={{
        left: `${layout.leftPct}%`,
        width: `${layout.widthPct}%`,
      }}
      title={WEEK_RISK_TITLES[episode.label]}
    >
      <span className="line-clamp-2">{WEEK_RISK_TITLES[episode.label]}</span>
    </button>
  );
}
```

---

## `src/components/week/DayContextPanel.tsx`

```tsx
"use client";

import type { WeekDayColumn } from "@/lib/week-risk-view-model";
import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { cn } from "@/lib/utils";
import { WEEK_RISK_TITLES, severityDotClass } from "./week-risk-meta";

function fmtRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const t = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${t.format(a)}–${t.format(b)}`;
  } catch {
    return "";
  }
}

type DayContextPanelProps = {
  day: WeekDayColumn | null;
  episodesForDay: WeekRiskEpisodeVM[];
  onPickEpisode: (id: string) => void;
  selectedEpisodeId: string | null;
  className?: string;
};

export function DayContextPanel({
  day,
  episodesForDay,
  onPickEpisode,
  selectedEpisodeId,
  className,
}: DayContextPanelProps) {
  const selectedEpisode = selectedEpisodeId
    ? episodesForDay.find((e) => e.id === selectedEpisodeId)
    : undefined;

  if (!day) {
    return (
      <div
        className={cn(
          "rounded-xl bg-slate-950/40 p-5 text-sm text-slate-500 ring-1 ring-white/[0.06]",
          className,
        )}
      >
        Choose a day on the strip to see that day&apos;s schedule.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-[#0a0f1c]/80 p-5 ring-1 ring-white/[0.07] sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-white">
            {day.weekdayLabel}{" "}
            <span className="font-normal text-slate-400">{day.dateLabel}</span>
          </p>
        </div>
        {day.dayStrainHint != null ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Load
            </p>
            <p className="text-lg font-semibold tabular-nums text-amber-200/90">
              {day.dayStrainHint}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-medium text-slate-400">On the calendar</p>
        {day.shifts.length === 0 ? (
          <p className="text-sm text-slate-600">Nothing starting this day.</p>
        ) : (
          <ul className="space-y-2">
            {day.shifts.map((s) => (
              <li
                key={s.id}
                className="rounded-lg bg-slate-950/50 px-3 py-2.5 text-sm text-slate-300 ring-1 ring-white/[0.04]"
              >
                <span className="font-medium text-slate-100">{s.title}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {fmtRange(s.startTime, s.endTime)} ·{" "}
                  {s.kind === "obligation"
                    ? "Obligation"
                    : s.blockType.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-xs font-medium text-slate-400">Risks this day</p>
        {episodesForDay.length === 0 ? (
          <p className="text-sm text-slate-600">No risk windows touch this day.</p>
        ) : (
          <ul className="space-y-2">
            {episodesForDay.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onPickEpisode(e.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    selectedEpisodeId === e.id
                      ? "bg-teal-950/40 text-slate-100 ring-1 ring-teal-400/35"
                      : "bg-slate-950/30 text-slate-400 ring-1 ring-white/[0.04] hover:bg-slate-900/50 hover:text-slate-200",
                  )}
                >
                  <span
                    className={cn(
                      "mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle",
                      severityDotClass(e.severity),
                    )}
                    aria-hidden
                  />
                  <span className="font-medium text-slate-200">
                    {WEEK_RISK_TITLES[e.label]}
                  </span>
                  <span className="mt-1 block pl-4 text-xs leading-snug text-slate-500">
                    {e.headline}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedEpisode ? (
        <div className="mt-6 rounded-lg bg-teal-950/25 px-4 py-4 ring-1 ring-teal-500/15">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-400/90">
            Why it matters
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {selectedEpisode.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
```

---

## `src/components/week/WeeklyTopDangers.tsx`

```tsx
"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { WEEK_RISK_TITLES } from "./week-risk-meta";
import { cn } from "@/lib/utils";
import { WhatToAvoidSection } from "@/components/features/today-plan/WhatToAvoidSection";
import { todayAvoidanceGridClass } from "@/components/features/today-plan/today-surfaces";
import { IconWarning } from "@/components/icons/NavIcons";
import { WeekDangerCard } from "./WeekDangerCard";

type WeeklyTopDangersProps = {
  data: Pick<CircadianInjuryMapData, "topRisks">;
  className?: string;
};

export function WeeklyTopDangers({ data, className }: WeeklyTopDangersProps) {
  const dangers = data.topRisks.slice(0, 3);

  return (
    <WhatToAvoidSection
      className={cn(className)}
      tone="rose"
      titleId="week-top-dangers-title"
      title="What to avoid this week"
      contentClassName="p-6 pt-5 md:p-8 md:pt-6"
      titleIcon={
        <IconWarning className="h-[18px] w-[18px] text-rose-100/95" />
      }
    >
      <div
        className={cn(
          todayAvoidanceGridClass,
          "gap-5 lg:grid-cols-3",
        )}
      >
        {dangers.map((r, i) => (
          <WeekDangerCard
            key={`${r.label}-${i}`}
            categoryLabel={`${WEEK_RISK_TITLES[r.label]} · ${r.severity}`}
            title={r.headline}
            detail={r.detail}
          />
        ))}
      </div>
    </WhatToAvoidSection>
  );
}
```

---

## `src/components/week/WeekDangerCard.tsx`

```tsx
"use client";

import { IconClose } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

type WeekDangerCardProps = {
  /** Category line — small caps above the headline. */
  categoryLabel: string;
  title: string;
  detail: string;
  className?: string;
};

/**
 * Week “harm to avoid” tile — mirrors Today {@link AvoidanceCard} layout with
 * rose / X emphasis to match schedule-injury framing.
 */
export function WeekDangerCard({
  categoryLabel,
  title,
  detail,
  className,
}: WeekDangerCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 gap-4 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/50 to-[#0a1020]/90",
        "p-5 transition-[box-shadow] duration-200 md:gap-5 md:p-6",
        "ring-1 ring-white/[0.07]",
        "hover:ring-rose-500/20",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-rose-500/40 via-rose-500/18 to-transparent opacity-90"
        aria-hidden
      />

      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600/25 text-rose-50 ring-1 ring-rose-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] md:h-11 md:w-11"
        aria-hidden
      >
        <IconClose className="h-[18px] w-[18px]" />
      </div>

      <div className="relative min-w-0 flex-1 py-0.5 md:py-px">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-300/70">
          {categoryLabel}
        </p>
        <h3 className="mt-1 text-[13px] font-semibold leading-snug text-slate-50 md:text-sm">
          {title}
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-slate-400 md:text-[13px] md:leading-relaxed">
          {detail}
        </p>
      </div>
    </article>
  );
}
```

---

## `src/components/week/week-risk-meta.ts`

```ts
import type { Severity } from "@/lib/types";
import type { WeekRiskLabel } from "@/lib/week-risk-view-model";

export const WEEK_RISK_TITLES: Record<WeekRiskLabel, string> = {
  rapid_flip: "Rapid circadian flip",
  short_turnaround: "Short turnaround",
  low_recovery: "Low recovery window",
  unsafe_drive: "Unsafe fatigue — commute",
  repeated_nights_no_reset: "Repeated nights — thin reset",
  missed_anchor_sleep: "Missed anchor sleep block",
  wearable_recovery_deficit: "Wearable recovery deficit",
  isolation_low_opportunity: "Isolation — low recovery opportunity",
};

/** Severity → subtle accent (avoid painting the whole UI red). */
export function severityAccent(sev: Severity): string {
  switch (sev) {
    case "low":
      return "bg-slate-500/25 border-slate-500/35 text-slate-200";
    case "moderate":
      return "bg-amber-500/15 border-amber-400/35 text-amber-100/95";
    case "high":
      return "bg-orange-500/18 border-orange-400/40 text-orange-100/95";
    case "critical":
      return "bg-rose-600/22 border-rose-500/45 text-rose-50/95";
    default:
      return "bg-slate-600/20 border-slate-500/30 text-slate-200";
  }
}

export function severityDotClass(sev: Severity): string {
  switch (sev) {
    case "low":
      return "bg-slate-400";
    case "moderate":
      return "bg-amber-400";
    case "high":
      return "bg-orange-400";
    case "critical":
      return "bg-rose-400";
    default:
      return "bg-slate-400";
  }
}

export function blockTypeClasses(
  blockType: string,
  kind: "shift" | "obligation",
): string {
  if (kind === "obligation") {
    return "border border-violet-500/35 bg-violet-950/50 text-violet-100/90";
  }
  switch (blockType) {
    case "night_shift":
      return "border border-indigo-400/30 bg-indigo-950/55 text-indigo-100/95";
    case "evening_shift":
      return "border border-violet-400/25 bg-violet-950/45 text-violet-100/90";
    case "day_shift":
      return "border border-teal-400/25 bg-teal-950/40 text-teal-50/95";
    case "transition_day":
      return "border border-cyan-400/25 bg-cyan-950/35 text-cyan-50/90";
    case "off_day":
      return "border border-slate-600/30 bg-slate-900/40 text-slate-300";
    default:
      return "border border-slate-600/35 bg-slate-900/45 text-slate-200";
  }
}

export function strainScoreHue(score: number): string {
  if (score < 35) return "text-teal-300";
  if (score < 60) return "text-amber-200";
  if (score < 80) return "text-orange-300";
  return "text-rose-300";
}
```

---

## `src/components/week/ObligationBlock.tsx`

```tsx
"use client";

import type { WeekShiftSegment } from "@/lib/week-risk-view-model";
import type { SegmentLayout } from "@/lib/week-timeline-math";
import { ShiftBlock } from "./ShiftBlock";

/** Obligation / class / fixed block — same layout as shifts, distinct styling via `kind`. */
export function ObligationBlock({
  segment,
  layout,
}: {
  segment: WeekShiftSegment;
  layout: SegmentLayout;
}) {
  return <ShiftBlock segment={{ ...segment, kind: "obligation" }} layout={layout} />;
}
```

---

## `src/components/week/RiskEpisodeCard.tsx`

Exported for reuse; **not** mounted on the current Week page (episode detail lives in `DayContextPanel`).

```tsx
"use client";

import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { cn } from "@/lib/utils";
import { WEEK_RISK_TITLES, severityDotClass } from "./week-risk-meta";

function fmtWindow(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const d = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return `${d.format(a)} → ${d.format(b)}`;
  } catch {
    return "";
  }
}

export function RiskEpisodeCard({
  episode,
  className,
}: {
  episode: WeekRiskEpisodeVM | null;
  className?: string;
}) {
  if (!episode) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-slate-700/60 bg-slate-950/30 p-4 text-sm text-slate-500",
          className,
        )}
      >
        Select a risk band on the timeline or a day to see episode detail.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            severityDotClass(episode.severity),
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-500/90">
              {WEEK_RISK_TITLES[episode.label]}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-100">
              {episode.headline}
            </h3>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {fmtWindow(episode.startTime, episode.endTime)}
          </p>
          <p className="text-sm leading-relaxed text-slate-400">
            {episode.explanation}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
              Severity · {episode.severity}
            </span>
            <span className="rounded-md bg-teal-950/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-teal-400/90">
              Suggested · {episode.recommendationCategory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## `src/components/features/today-plan/WhatToAvoidSection.tsx`

(Used by `WeeklyTopDangers`.)

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { todayCardShell } from "./today-surfaces";

export type WhatToAvoidSectionProps = {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** `amber` = Today avoidance default; `rose` = week / schedule harm emphasis. */
  tone?: "amber" | "rose";
  /** Override heading id for a11y when multiple sections exist on the app. */
  titleId?: string;
  /** Class for the padded body below the header (spacing tweaks per page). */
  contentClassName?: string;
};

/**
 * Full-width framed section: warning-style header + inner content (e.g. a grid of AvoidanceCards).
 * Spacing aligns with other Today blocks via the parent `space-y-*` stack.
 */
export function WhatToAvoidSection({
  title,
  titleIcon,
  children,
  className,
  tone = "amber",
  titleId = "today-what-to-avoid-title",
  contentClassName,
}: WhatToAvoidSectionProps) {
  const iconWrap =
    tone === "rose"
      ? "bg-rose-500/[0.14] text-rose-100 ring-rose-400/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
      : "bg-amber-500/[0.12] text-amber-300 ring-amber-400/26 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]";

  return (
    <section className={cn("w-full", className)} aria-labelledby={titleId}>
      <div
        className={cn(
          "overflow-hidden bg-gradient-to-b from-slate-800/48 via-slate-900/42 to-[#0a1020]/96",
          todayCardShell,
        )}
      >
        <div className="border-b border-white/[0.065] bg-slate-950/25 px-5 py-4 md:px-6 md:py-[1.125rem]">
          <div className="flex items-center gap-3">
            {titleIcon ? (
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
                  iconWrap,
                )}
                aria-hidden
              >
                {titleIcon}
              </span>
            ) : null}
            <h2
              id={titleId}
              className="text-[0.9375rem] font-semibold tracking-tight text-white md:text-base"
            >
              {title}
            </h2>
          </div>
        </div>

        <div
          className={cn("p-5 md:p-6 md:pt-5", contentClassName)}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
```

---

## `src/components/features/today-plan/today-surfaces.ts`

```ts
import { cn } from "@/lib/utils";

/** Page-level vertical rhythm between Today sections. */
export const todaySectionStack = "space-y-7 md:space-y-9";

/** Primary elevated panel — shared by hero, live sync, recommendations, avoidance section shell. */
export const todayCardShell = cn(
  "rounded-2xl border border-slate-700/40",
  "shadow-[0_24px_64px_-32px_rgba(0,0,0,0.88),inset_0_1px_0_0_rgba(255,255,255,0.065)]",
);

/** Dark inset strip (notes, HRV explanation, etc.). */
export const todayInsetStrip = cn(
  "rounded-xl border border-slate-800/85 bg-slate-950/80",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.045)]",
);

/** Standard icon size inside 40×40-ish chips across Today cards. */
export const todayChipIconClass = "h-[18px] w-[18px]";

/** Hero + live sync column split on large screens. */
export const todayHeroRowClass =
  "grid gap-5 lg:grid-cols-[1fr_280px] lg:items-stretch lg:gap-5";

/** Recommendation cards: single column until `lg`, then three-up. */
export const todayRecommendationGridClass = "grid grid-cols-1 gap-5 lg:grid-cols-3";

/** Avoidance cards inside the framed section. */
export const todayAvoidanceGridClass = "grid grid-cols-1 gap-5 lg:grid-cols-2";
```

---

## `src/app/(dashboard)/layout.tsx`

Wraps `/week` (and other dashboard routes) in `AppShell`.

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
```

---

## `src/lib/navigation.ts`

Week route appears in `DASHBOARD_NAV` and `dashboardPageHeading("/week")` → **Circadian injury map**.

```ts
export type DashboardNavHref = "/week" | "/today" | "/recovery" | "/sandbox";

export type DashboardNavItem = {
  href: DashboardNavHref;
  label: string;
  /** Shown on larger screens or for accessibility context */
  description: string;
};

/** Primary shell navigation — order is intentional (scan: horizon → now → recovery → simulate). */
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  {
    href: "/week",
    label: "Week",
    description: "Circadian injury map for your rota horizon.",
  },
  {
    href: "/today",
    label: "Today",
    description: "Next best actions and anchor tasks for this shift window.",
  },
  {
    href: "/recovery",
    label: "Recovery",
    description: "Rhythm and rest signals without streak pressure.",
  },
  {
    href: "/sandbox",
    label: "Sandbox",
    description: "What-if shifts before you commit to a swap.",
  },
] as const;

/** Short label for the dashboard top bar (not the same as nav label). */
export function dashboardPageHeading(pathname: string): string {
  const map: Record<string, string> = {
    "/week": "Circadian injury map",
    "/today": "Today",
    "/dashboard": "Today",
    "/recovery": "Recovery",
    "/sandbox": "Sandbox",
    "/evidence": "Evidence lens",
  };
  return map[pathname] ?? "Noxturn";
}
```

---

*As of 2026-03-21 — regenerate or diff against the repo if paths change.*
