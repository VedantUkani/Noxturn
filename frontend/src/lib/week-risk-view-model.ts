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
