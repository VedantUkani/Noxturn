import { ApiError, getApiBase } from "./api";
import type { BlockType, ScheduleBlockInput } from "./types";

export type ScheduleImportResponse = {
  blocks: ScheduleBlockInput[];
  warnings: string[];
  parse_confidence: number;
  replan_recommended: boolean;
  change_summary: string[];
};

function parseImportJson(text: string): ScheduleImportResponse {
  const raw = JSON.parse(text || "{}") as Record<string, unknown>;
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  return {
    blocks: blocks as ScheduleBlockInput[],
    warnings: Array.isArray(raw.warnings)
      ? (raw.warnings as string[])
      : [],
    parse_confidence:
      typeof raw.parse_confidence === "number" ? raw.parse_confidence : 1,
    replan_recommended: Boolean(raw.replan_recommended),
    change_summary: Array.isArray(raw.change_summary)
      ? (raw.change_summary as string[])
      : [],
  };
}

async function postMultipart(
  path: string,
  file: File,
  userId: string,
  commuteMinutes: number,
): Promise<ScheduleImportResponse> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const form = new FormData();
  form.append("file", file);
  form.append("user_id", userId);
  form.append("commute_minutes", String(commuteMinutes));

  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const jwt = localStorage.getItem("noxturn_backend_jwt");
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  }

  const res = await fetch(url, { method: "POST", body: form, headers, cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(
      path,
      res.status,
      text.slice(0, 220) || `Request failed (${res.status})`,
    );
  }
  return parseImportJson(text);
}

/** CSV or Excel (.xlsx / .xls) — backend `/schedule/upload`. */
export function postScheduleSpreadsheetUpload(
  file: File,
  userId: string,
  commuteMinutes = 30,
) {
  return postMultipart("/schedule/upload", file, userId, commuteMinutes);
}

/** iCal / .ics — backend `/schedule/upload-ical`. */
export function postScheduleIcsUpload(
  file: File,
  userId: string,
  commuteMinutes = 30,
) {
  return postMultipart("/schedule/upload-ical", file, userId, commuteMinutes);
}

export function normalizeImportedBlock(raw: unknown): ScheduleBlockInput {
  const b = raw as Record<string, unknown>;
  const id =
    typeof b.id === "string" && b.id.length > 0 ? b.id : crypto.randomUUID();
  const block_type = b.block_type as BlockType;
  const startRaw = b.start_time;
  const endRaw = b.end_time;
  const start_time =
    typeof startRaw === "string"
      ? new Date(startRaw).toISOString()
      : new Date(String(startRaw)).toISOString();
  const end_time =
    typeof endRaw === "string"
      ? new Date(endRaw).toISOString()
      : new Date(String(endRaw)).toISOString();
  const title =
    b.title != null && String(b.title).trim() !== ""
      ? String(b.title)
      : undefined;
  const commuteBefore =
    typeof b.commute_before_minutes === "number"
      ? b.commute_before_minutes
      : undefined;
  const commuteAfter =
    typeof b.commute_after_minutes === "number"
      ? b.commute_after_minutes
      : undefined;
  return {
    id,
    block_type,
    title,
    start_time,
    end_time,
    ...(commuteBefore !== undefined
      ? { commute_before_minutes: commuteBefore }
      : {}),
    ...(commuteAfter !== undefined
      ? { commute_after_minutes: commuteAfter }
      : {}),
  };
}

export function normalizeImportedBlocks(
  blocks: unknown[],
): ScheduleBlockInput[] {
  return blocks.map(normalizeImportedBlock);
}
