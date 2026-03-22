"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockType, ScheduleBlockInput } from "@/lib/types";
import {
  getOrCreateUserId,
  getStoredScheduleBlocks,
  storeScheduleBlocks,
} from "@/lib/session";
import { postPlansGenerateClaude } from "@/lib/noxturn-api";
import { cn } from "@/lib/utils";
import { ScheduleImportSection } from "./ScheduleImportSection";

const BLOCK_OPTIONS: { value: BlockType; label: string }[] = [
  { value: "day_shift", label: "Day shift" },
  { value: "evening_shift", label: "Evening" },
  { value: "night_shift", label: "Night shift" },
  { value: "off_day", label: "Off day" },
  { value: "transition_day", label: "Transition" },
];

const PLAN_DATE_KEY = "noxturn_last_plan_date";
const PROFILE_KEY = "noxturn_profile";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDatetimeLocalValue(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fromDatetimeLocalValue(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function defaultDraft() {
  const start = new Date();
  start.setHours(7, 0, 0, 0);
  const end = new Date();
  end.setHours(15, 0, 0, 0);
  return {
    block_type: "day_shift" as BlockType,
    start: toDatetimeLocalValue(start),
    end: toDatetimeLocalValue(end),
    title: "",
  };
}

function formatBlockRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return isoStart;
    const opts: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return `${a.toLocaleString(undefined, opts)} → ${b.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  } catch {
    return isoStart;
  }
}

function blockTypeLabel(t: BlockType) {
  return BLOCK_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

function normalizeBlocks(raw: ScheduleBlockInput[]): ScheduleBlockInput[] {
  let changed = false;
  const next = raw.map((b) => {
    if (b.id) return b;
    changed = true;
    return { ...b, id: crypto.randomUUID() };
  });
  if (changed) storeScheduleBlocks(next);
  return next;
}

function sortByStart(a: ScheduleBlockInput, b: ScheduleBlockInput) {
  return a.start_time.localeCompare(b.start_time);
}

function getCommuteMinutes(): number {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return 30;
    const p = JSON.parse(raw) as { commuteMinutes?: number };
    return p.commuteMinutes ?? 30;
  } catch {
    return 30;
  }
}

type ReplanStatus = "idle" | "pending" | "done" | "error";

export function ScheduleEditorClient() {
  const [blocks, setBlocks] = useState<ScheduleBlockInput[]>([]);
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(defaultDraft);
  const [error, setError] = useState<string | null>(null);
  const [replanStatus, setReplanStatus] = useState<ReplanStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBlocks(normalizeBlocks(getStoredScheduleBlocks()));
    setReady(true);
  }, []);

  /** Clears plan date and debounce-fires Claude replan after every schedule mutation. */
  const triggerReplan = useCallback((updatedBlocks: ScheduleBlockInput[]) => {
    // Invalidate cached plan date so Today page re-fetches on next visit
    try { localStorage.removeItem(PLAN_DATE_KEY); } catch { /* ignore */ }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    setReplanStatus("pending");

    debounceRef.current = setTimeout(async () => {
      const userId = getOrCreateUserId();
      if (!userId || updatedBlocks.length === 0) {
        setReplanStatus("idle");
        return;
      }
      try {
        await postPlansGenerateClaude({
          user_id: userId,
          blocks: updatedBlocks,
          commute_minutes: getCommuteMinutes(),
          plan_hours: 24,
        });
        setReplanStatus("done");
        doneTimerRef.current = setTimeout(() => setReplanStatus("idle"), 4000);
      } catch {
        setReplanStatus("error");
        doneTimerRef.current = setTimeout(() => setReplanStatus("idle"), 5000);
      }
    }, 1800);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const mergeImported = useCallback((incoming: ScheduleBlockInput[]) => {
    setBlocks((prev) => {
      const next = [...prev, ...incoming].sort(sortByStart);
      storeScheduleBlocks(next);
      triggerReplan(next);
      return next;
    });
  }, [triggerReplan]);

  const openAdd = () => {
    setDraft(defaultDraft());
    setError(null);
    setAdding(true);
  };

  const cancelAdd = () => {
    setAdding(false);
    setError(null);
  };

  const submitAdd = () => {
    const startIso = fromDatetimeLocalValue(draft.start);
    const endIso = fromDatetimeLocalValue(draft.end);
    if (!startIso || !endIso) {
      setError("Choose a valid start and end time.");
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    const block: ScheduleBlockInput = {
      id: crypto.randomUUID(),
      block_type: draft.block_type,
      start_time: startIso,
      end_time: endIso,
      ...(draft.title.trim() ? { title: draft.title.trim() } : {}),
    };
    setBlocks((prev) => {
      const next = [...prev, block].sort(sortByStart);
      storeScheduleBlocks(next);
      triggerReplan(next);
      return next;
    });
    setDraft(defaultDraft());
    setAdding(false);
  };

  const remove = (id: string | undefined) => {
    if (!id) return;
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      storeScheduleBlocks(next);
      triggerReplan(next);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <ScheduleImportSection onBlocksImported={mergeImported} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-200">Your shifts</h2>
          {replanStatus !== "idle" ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                replanStatus === "pending" &&
                  "bg-[#141f42] text-[#86c9ff]",
                replanStatus === "done" &&
                  "bg-[#45e0d4]/15 text-[#45e0d4]",
                replanStatus === "error" &&
                  "bg-rose-500/10 text-rose-300",
              )}
            >
              {replanStatus === "pending" ? (
                <>
                  <span
                    className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent"
                    aria-hidden
                  />
                  Updating plan…
                </>
              ) : replanStatus === "done" ? (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                  Plan updated
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v4M6 9.5v.5" />
                  </svg>
                  Update failed — will retry on Today page
                </>
              )}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openAdd}
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition-colors",
            "bg-teal-400 text-slate-950 hover:bg-teal-300",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]",
          )}
          aria-label="Add a shift or block"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {adding ? (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            New block
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs text-slate-400">Type</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
                value={draft.block_type}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    block_type: e.target.value as BlockType,
                  }))
                }
              >
                {BLOCK_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-400">Label (optional)</span>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
                placeholder="e.g. Ward A — long day"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400">Starts</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
                value={draft.start}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, start: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400">Ends</span>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
                value={draft.end}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, end: e.target.value }))
                }
              />
            </label>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submitAdd}
              className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-teal-300 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-300"
            >
              Save block
            </button>
            <button
              type="button"
              onClick={cancelAdd}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {!ready ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700/90 bg-slate-950/30 px-4 py-8 text-center text-sm text-slate-500">
          No blocks yet. Import from Google, Outlook, or a file above — or tap{" "}
          <span className="font-medium text-slate-400">+</span> to add one
          manually.
        </p>
      ) : (
        <ul className="space-y-2">
          {blocks.map((b) => (
            <li
              key={b.id ?? `${b.start_time}-${b.end_time}`}
              className="flex items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/35 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-teal-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-200/90">
                    {blockTypeLabel(b.block_type)}
                  </span>
                  {b.title ? (
                    <span className="truncate text-sm font-medium text-slate-100">
                      {b.title}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {formatBlockRange(b.start_time, b.end_time)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(b.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-950/40 hover:text-rose-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
