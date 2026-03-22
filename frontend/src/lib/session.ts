import type { ScheduleBlockInput } from "./types";

const USER_ID_KEY = "noxturn_user_id";
const JWT_KEY = "noxturn_backend_jwt";
const SCHEDULE_KEY = "noxturn_schedule_blocks";
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

export function persistPlanSnapshot(plan: { avoid_list: string[] }): void {
  setStoredAvoidList(plan.avoid_list ?? []);
}

type AuthApiResponse = { access_token: string; user_id: string };

/**
 * Ensures a valid backend JWT exists in localStorage.
 * Auto-registers a synthetic account on first visit (email = `{uuid}@noxturn.local`),
 * or re-logs in if the account already exists.
 * Returns the JWT string so callers can immediately use it.
 */
export async function ensureBackendAuth(): Promise<string> {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(JWT_KEY);
  if (existing) {
    try {
      const [, b64] = existing.split(".");
      const payload = JSON.parse(atob(b64)) as { exp?: number };
      // Accept token if it won't expire within the next 60 seconds
      if (typeof payload.exp === "number" && payload.exp > Date.now() / 1000 + 60) {
        return existing;
      }
    } catch {
      // Malformed token — fall through to re-auth
    }
  }

  const userId = getOrCreateUserId();
  const email = `${userId}@noxturn.local`;
  const base = (
    (process.env.NEXT_PUBLIC_API_BASE as string | undefined) ?? "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  // Try register first; fall back to login if email already exists (409)
  let res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name: `User ${userId.slice(0, 8)}`, role: "nurse" }),
  });

  if (res.status === 409) {
    res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`Auth failed: ${msg.slice(0, 160)}`);
  }

  const data = (await res.json()) as AuthApiResponse;
  localStorage.setItem(JWT_KEY, data.access_token);
  // Keep local user_id in sync with the backend-assigned UUID
  localStorage.setItem(USER_ID_KEY, data.user_id);
  return data.access_token;
}
