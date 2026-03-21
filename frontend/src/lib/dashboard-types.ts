import type { TaskCategory, TaskStatus } from "./types";
import type { TodayRecommendationId } from "@/components/features/today-plan/today-demo-data";

/** UI may show snooze before any API support exists. */
export type DashboardTaskStatus = TaskStatus | "snoozed";

export type WhatChangedSource = "task" | "recovery_sync" | "check_in";

export type WhatChangedEntry = {
  id: string;
  headline: string;
  reason: string;
  source: WhatChangedSource;
};

export type RecoverySimulationBand = "stable" | "low_recovery" | "severe_strain";

export type DashboardTask = {
  id: string;
  title: string;
  category: TaskCategory;
  /** True = anchor (plan-critical); false = support / optional layer. */
  anchor: boolean;
  scheduled_time: string;
  duration_minutes: number;
  status: DashboardTaskStatus;
  /** Human rationale shown in details / secondary lines. */
  rationale: string;
  evidence_ref?: string | null;
  snoozedUntil?: string;
};

export type TodayNextBestHero = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  /** Task this hero is tied to (for Start / Reminder actions). */
  linkedTaskId: string;
};

export type TodayRecommendationRow = {
  id: TodayRecommendationId;
  title: string;
  value: string;
  note: string;
};

export type TodayAvoidanceRow = {
  id: string;
  title: string;
  detail: string;
  icon: "snack" | "stride";
};

export type TodayDashboardPayload = {
  planMode: string;
  vitals: {
    hrv: number;
    liveSync: boolean;
    message: string;
    readinessScore: number;
    metricLabel?: string;
  };
  nextBest: TodayNextBestHero;
  tasks: DashboardTask[];
  recommendations: readonly TodayRecommendationRow[];
  avoid: readonly TodayAvoidanceRow[];
};
