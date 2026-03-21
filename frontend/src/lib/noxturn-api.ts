import { getJson, postJson } from "./api";
import type {
  DashboardTodayResponse,
  PlanGenerateResponse,
  RagResponse,
  RiskComputeResponse,
  ScheduleBlockInput,
  TaskEventResponse,
  WearableImportResponse,
} from "./types";

export async function fetchDashboardToday(
  userId: string,
): Promise<DashboardTodayResponse> {
  const q = encodeURIComponent(userId);
  return getJson<DashboardTodayResponse>(`/dashboard/today?user_id=${q}`);
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
