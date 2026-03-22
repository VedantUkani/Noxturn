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
  const top = sorted[0];
  const weekDifficultyLine = top
    ? `The strongest schedule signal is “${top.headline.toLowerCase()}” — worth pacing around that window.`
    : undefined;

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
    weekDifficultyLine,
    recoveryWindowLine: undefined,
    topRisks,
    days: buildDayColumnsFromShifts(weekStart, shifts),
    episodes,
  };
}
