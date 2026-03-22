import type { ScheduleBlockInput } from "./types";

const USER_ID_KEY = "noxturn_user_id";
const SCHEDULE_KEY = "noxturn_schedule_blocks";
const PLAN_MODE_KEY = "noxturn_plan_mode";
const AVOID_LIST_KEY = "noxturn_avoid_list";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, next);
  return next;
}

export function storeScheduleBlocks(blocks: ScheduleBlockInput[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(blocks));
}

export function getStoredScheduleBlocks(): ScheduleBlockInput[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SCHEDULE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ScheduleBlockInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredPlanMode(mode: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PLAN_MODE_KEY, mode);
  window.dispatchEvent(new Event("noxturn-plan-mode"));
}

export function getStoredPlanMode(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PLAN_MODE_KEY);
}

/** Persisted when a plan is generated (see `persistPlanSnapshot`). */
export function setStoredAvoidList(items: string[]): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(AVOID_LIST_KEY, JSON.stringify(items));
}

export function getStoredAvoidList(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(AVOID_LIST_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistPlanSnapshot(plan: {
  plan_mode: string;
  avoid_list: string[];
}): void {
  setStoredPlanMode(plan.plan_mode);
  setStoredAvoidList(plan.avoid_list ?? []);
}
