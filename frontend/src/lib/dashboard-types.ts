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
  /**
   * Plan-critical vs optional — from the backend plan (`anchor_flag`), set by the
   * Noxturn planner agent (Claude or rule-based), not the UI.
   */
  anchor: boolean;
  scheduled_time: string;
  duration_minutes: number;
  status: DashboardTaskStatus;
  /** Human rationale shown in details / secondary lines. */
  rationale: string;
  evidence_ref?: string | null;
  snoozedUntil?: string;
};

/**
 * “Next best action” hero — production copy comes from the plan’s
 * `next_best_action` on the dashboard API (Claude or rule planner), mapped by
 * `nextBestFromApi` in `mocks/today-dashboard-payload.ts`. Demo strings in
 * `today-demo-data` are placeholders only; live copy updates when the plan is
 * generated or replanned.
 */
export type TodayNextBestHero = {
  eyebrow: string;
  /** Primary headline (e.g. action title from planner). */
  titleLine1: string;
  /** Secondary line — API mapper uses task category; can evolve with planner fields. */
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

/**
 * Today dashboard model for the live page. In production, `vitals`
 * (including whether to show live sync), `nextBest`, and `tasks` / anchor split
 * come from the dashboard API — outputs of the planner agent and persisted plan.
 * `dashboard-live.ts` only simulates changes locally for the demo shell.
 */
export type TodayDashboardPayload = {
  vitals: {
    hrv: number;
    /** Shown when the API indicates fresh wearable/sync-backed vitals (agent-driven). */
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
