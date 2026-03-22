import { getJson, postJson } from "./api";
import type {
  DashboardTodayResponse,
  PlanGenerateResponse,
  RagResponse,
  RecoveryAnalyticsResponse,
  ReplanResponse,
  RiskComputeResponse,
  ScheduleBlockInput,
  TaskEventResponse,
  WearableImportResponse,
} from "./types";

export async function fetchDashboardToday(): Promise<DashboardTodayResponse> {
  return getJson<DashboardTodayResponse>(`/dashboard/today`);
}

export async function postPlansGenerate(body: {
  user_id: string;
  blocks: ScheduleBlockInput[];
  commute_minutes: number;
  plan_hours?: number;
  persona_id?: string | null;
}): Promise<PlanGenerateResponse> {
  return postJson<PlanGenerateResponse>("/plans/generate", body);
}

export async function postPlansGenerateClaude(body: {
  user_id: string;
  blocks: ScheduleBlockInput[];
  commute_minutes: number;
  plan_hours?: number;
  persona_id?: string | null;
}): Promise<PlanGenerateResponse> {
  return postJson<PlanGenerateResponse>("/plans/generate-claude", body);
}

export async function postPlansReplan(body: {
  user_id: string;
  blocks: ScheduleBlockInput[];
  commute_minutes: number;
  use_claude?: boolean;
  task_event?: { task_id: string; status: "completed" | "skipped" } | null;
  persona_id?: string | null;
}): Promise<ReplanResponse> {
  return postJson<ReplanResponse>("/plans/replan", body);
}

export async function postRisksCompute(body: {
  user_id: string;
  blocks: ScheduleBlockInput[];
  commute_minutes: number;
}): Promise<RiskComputeResponse> {
  return postJson<RiskComputeResponse>("/risks/compute", body);
}

export async function postTasksEvent(body: {
  user_id: string;
  task_id: string;
  status: "completed" | "skipped";
}): Promise<TaskEventResponse> {
  return postJson<TaskEventResponse>("/tasks/event", body);
}

export async function getRagRetrieve(
  query: string,
  topK = 4,
): Promise<RagResponse> {
  const q = encodeURIComponent(query);
  return getJson<RagResponse>(`/rag/retrieve?query=${q}&top_k=${topK}`);
}

export async function postWearablesImport(body: {
  user_id: string;
  sleep_hrs: number;
  sleep_start: string;
  sleep_end: string;
  restlessness?: number;
  resting_hr?: number;
}): Promise<WearableImportResponse> {
  return postJson<WearableImportResponse>("/wearables/import", body);
}

export async function fetchRecoveryAnalytics(): Promise<RecoveryAnalyticsResponse> {
  // The endpoint uses the JWT (Authorization header) to identify the user,
  // not a query param — getJson automatically attaches the Bearer token.
  return getJson<RecoveryAnalyticsResponse>(`/recovery/analytics`);
}
