// ─── Shared TypeScript types for Noxturn frontend ───

export type BlockType = "day_shift" | "night_shift" | "evening_shift" | "off_day" | "transition_day";
export type Severity  = "low" | "moderate" | "high" | "critical";
export type TaskStatus = "planned" | "completed" | "skipped" | "expired";
export type PlanMode  = "protect" | "recover" | "stabilize" | "perform";
export type RecoveryRhythm = "steady" | "rebuilding" | "interrupted" | "unknown";

export type ScheduleBlockInput = {
  id?: string;
  block_type: BlockType;
  title?: string;
  start_time: string;
  end_time: string;
  commute_before_minutes?: number;
  commute_after_minutes?: number;
};

export type RiskEpisode = {
  id?: string;
  label: string;
  severity: Severity;
  score?: number;
  start_time: string;
  end_time?: string;
  explanation?: string;
};

export type PlanTask = {
  id: string;
  title: string;
  category?: string;
  anchor_flag: boolean;
  status: TaskStatus;
  scheduled_time?: string;
  duration_minutes?: number;
  why_now?: string;
  evidence_ref?: string;
};

export type NextBestAction = {
  title: string;
  why_now: string;
  scheduled_time?: string;
  category?: string;
};

export type PlanResponse = {
  plan_id?: string;
  plan_mode: PlanMode;
  strain_score?: number;
  next_best_action: NextBestAction;
  avoid_list: string[];
  tasks: PlanTask[];
  evidence_refs?: string[];
};

export type DashboardResponse = PlanResponse & {
  recovery_rhythm_label: RecoveryRhythm;
  recovery_score?: number | null;
  anchor_tasks: PlanTask[];
};

export type RiskResponse = {
  risk_episodes: RiskEpisode[];
  strain_score: number;
};

export type WearableResponse = {
  recovery_score: number;
  sleep_hrs: number;
  recovery_rhythm_label?: RecoveryRhythm;
};

export type RagItem = {
  id: string;
  title?: string;
  name?: string;
  content?: string;
  evidence_note?: string;
  when_it_applies?: string;
  score: number;
  type?: "intervention" | "evidence";
};

export type RagResponse = {
  cards: RagItem[];
  evidence: RagItem[];
};

export type ImportResponse = {
  blocks: Array<{
    id: string;
    block_type: BlockType;
    start_time: string;
    end_time: string;
    title?: string;
  }>;
  warnings: string[];
  parse_confidence: number;
};

export type SandboxResponse = {
  original_strain_score: number;
  projected_strain_score: number;
  strain_delta: number;
  verdict: string;
  explanation: string;
};

// ─── UI helpers ───

export const SEVERITY_RANK: Record<Severity, number> = {
  low: 1, moderate: 2, high: 3, critical: 4,
};

export const PLAN_MODE_META: Record<PlanMode, { label: string; color: string; bg: string; description: string }> = {
  protect:   { label: "Protect",   color: "text-red-400",    bg: "bg-red-950/60 border-red-800/50",    description: "High risk — sleep is the priority above all." },
  recover:   { label: "Recover",   color: "text-amber-400",  bg: "bg-amber-950/60 border-amber-800/50", description: "Active recovery phase. Follow tasks closely." },
  stabilize: { label: "Stabilize", color: "text-indigo-400", bg: "bg-indigo-950/60 border-indigo-800/50", description: "Prevention-focused. Maintain your rhythm." },
  perform:   { label: "Perform",   color: "text-emerald-400", bg: "bg-emerald-950/60 border-emerald-800/50", description: "Low risk. Keep your habits consistent." },
};

export const SEVERITY_META: Record<Severity, { color: string; bg: string; dot: string }> = {
  low:      { color: "text-emerald-400", bg: "bg-emerald-950/60 border-emerald-800/40", dot: "bg-emerald-400" },
  moderate: { color: "text-amber-400",   bg: "bg-amber-950/60 border-amber-800/40",    dot: "bg-amber-400"   },
  high:     { color: "text-orange-400",  bg: "bg-orange-950/60 border-orange-800/40",   dot: "bg-orange-400"  },
  critical: { color: "text-red-400",     bg: "bg-red-950/60 border-red-800/40",         dot: "bg-red-400"     },
};

export const RHYTHM_META: Record<RecoveryRhythm, { label: string; color: string; icon: string }> = {
  steady:      { label: "Steady",      color: "text-emerald-400", icon: "●" },
  rebuilding:  { label: "Rebuilding",  color: "text-amber-400",   icon: "◑" },
  interrupted: { label: "Interrupted", color: "text-red-400",     icon: "○" },
  unknown:     { label: "Unknown",     color: "text-slate-400",   icon: "?" },
};
