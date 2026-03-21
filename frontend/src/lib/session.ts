export type ScheduleBlockInput = {
  id?: string;
  block_type: "day_shift" | "night_shift" | "evening_shift" | "off_day" | "transition_day";
  title?: string;
  start_time: string;
  end_time: string;
  commute_before_minutes?: number;
  commute_after_minutes?: number;
};

const USER_ID_KEY = "noxturn_user_id";
const SCHEDULE_KEY = "noxturn_schedule_blocks";

export function getOrCreateUserId(): string {
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) {
    return existing;
  }
  const next = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, next);
  return next;
}

export function storeScheduleBlocks(blocks: ScheduleBlockInput[]): void {
  window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(blocks));
}

export function getStoredScheduleBlocks(): ScheduleBlockInput[] {
  const raw = window.localStorage.getItem(SCHEDULE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as ScheduleBlockInput[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
