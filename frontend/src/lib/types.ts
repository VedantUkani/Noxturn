/**
 * Domain + API types — align with `backend/app/models/schemas.py` JSON shapes.
 * Datetimes arrive as ISO strings over the wire.
 */

export type BlockType =
  | "day_shift"
  | "night_shift"
  | "evening_shift"
  | "off_day"
  | "transition_day";

export type TaskStatus =
  | "planned"
  | "completed"
  | "skipped"
  | "expired"
  | "replaced";

export type TaskCategory =
  | "sleep"
  | "nap"
  | "light_timing"
  | "caffeine_cutoff"
  | "meal"
  | "social"
  | "relaxation"
  | "movement"
  | "mindfulness"
  | "safety";

export type Severity = "low" | "moderate" | "high" | "critical";

export type RecoveryRhythmLabel =
  | "steady"
  | "rebuilding"
  | "interrupted"
  | "unknown";

export type PlanModeKey =
  | "protect"
  | "recover"
  | "stabilize"
  | "perform"
  | string;

export type NavPlanModeDisplay = {
  key: PlanModeKey;
  label: string;
};

/** Stored client-side and sent as `blocks` to `/plans/generate` (ISO datetimes). */
export type ScheduleBlockInput = {
  id?: string;
  block_type: BlockType;
  title?: string;
  start_time: string;
  end_time: string;
  commute_before_minutes?: number;
  commute_after_minutes?: number;
};

export type PlanTask = {
  id: string;
  category: TaskCategory;
  title: string;
  description?: string | null;
  scheduled_time: string;
  duration_minutes: number;
  anchor_flag: boolean;
  optional_flag?: boolean;
  source_reason?: string | null;
  evidence_ref?: string | null;
  status: TaskStatus;
  sort_order?: number;
};

export type NextBestAction = {
  task_id: string;
  category: TaskCategory;
  title: string;
  description: string;
  why_now: string;
  duration_minutes: number;
};

export type PlanGenerateResponse = {
  plan_mode: string;
  risk_summary: Record<string, unknown>;
  tasks: PlanTask[];
  avoid_list: string[];
  next_best_action: NextBestAction;
  evidence_refs?: Record<string, unknown>[];
};

export type DashboardTodayResponse = {
  user_id?: string | null;
  plan_mode: string;
  next_best_action: NextBestAction;
  anchor_tasks: PlanTask[];
  recovery_rhythm_label: string;
  recovery_score?: number | null;
};

export type RiskEpisode = {
  id?: string;
  label: string;
  severity: Severity;
  severity_score?: number;
  start_time: string;
  end_time: string;
  explanation?: Record<string, unknown>;
};

export type RiskComputeResponse = {
  circadian_strain_score: number;
  risk_episodes: RiskEpisode[];
  summary: string;
};

export type TaskEventResponse = {
  task_id: string;
  old_status: TaskStatus;
  new_status: TaskStatus;
  trigger_replan: boolean;
  message: string;
};

export type RagResponse = {
  cards?: unknown[];
  evidence?: unknown[];
};

export type WearableImportResponse = {
  sleep_hrs: number;
  sleep_start: string;
  sleep_end: string;
  restlessness?: number | null;
  resting_hr?: number | null;
  recovery_score: number;
  source: string;
};

export type ShiftSandboxResponse = {
  original_strain_score: number;
  projected_strain_score: number;
  strain_delta: number;
  recovery_bottleneck: Record<string, unknown>;
  verdict: string;
  explanation: string;
};

export const SEVERITY_RANK: Record<Severity, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};
