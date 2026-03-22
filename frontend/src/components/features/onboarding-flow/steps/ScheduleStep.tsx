"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type {
  ManualShiftDraft,
  OnboardingDraft,
  ScheduleImportResult,
} from "../types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

type ScheduleStepProps = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onAddShift: (shift: ManualShiftDraft) => void;
  onRemoveShift: (id: string) => void;
};

function countParseLines(text: string): number {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;
}

export function ScheduleStep({
  draft,
  onChange,
  onAddShift,
  onRemoveShift,
}: ScheduleStepProps) {
  const formId = useId();
  const [msType, setMsType] =
    useState<ManualShiftDraft["type"]>("day_shift");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [parsing, setParsing] = useState(false);
  const [manualImporting, setManualImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const runPasteImport = useCallback(() => {
    const txt = draft.scheduleNotes.trim();
    setError(null);
    if (!txt) {
      setError("Paste your schedule text before importing.");
      return;
    }
    setParsing(true);
    window.setTimeout(() => {
      setParsing(false);
      const lines = countParseLines(txt);
      const result: ScheduleImportResult = {
        count: Math.max(1, lines),
        warnings: ["Parsed rows may need review in the full schedule editor."],
      };
      onChange({ importComplete: result, scheduleDeferred: false });
      setToast(true);
    }, 1000);
  }, [draft.scheduleNotes, onChange]);

  const runManualImport = useCallback(() => {
    if (!draft.manualShifts.length) return;
    setError(null);
    setManualImporting(true);
    window.setTimeout(() => {
      setManualImporting(false);
      const result: ScheduleImportResult = {
        count: draft.manualShifts.length,
        warnings: [],
      };
      onChange({ importComplete: result, scheduleDeferred: false });
      setToast(true);
    }, 1000);
  }, [draft.manualShifts.length, onChange]);

  const addManualRow = useCallback(() => {
    setError(null);
    if (!date || !start || !end) {
      setError("Please fill date, start, and end time.");
      return;
    }
    onAddShift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: msType,
      title: title.trim(),
      date,
      start,
      end,
    });
    setTitle("");
    setDate("");
    setStart("");
    setEnd("");
  }, [date, start, end, msType, title, onAddShift]);

  const setMode = (mode: "paste" | "manual") => {
    onChange({ scheduleMode: mode, importComplete: null });
    setError(null);
  };

  const resetImport = useCallback(() => {
    onChange({ importComplete: null });
    setError(null);
  }, [onChange]);

  if (draft.scheduleDeferred) {
    return (
      <div className={cn(nx.card, "p-6 text-center")}>
        <p className="text-sm font-medium text-[#edf2ff]">
          You can import or edit shifts from the Schedule section anytime.
        </p>
        <p className="mt-2 text-xs text-[#7d89a6]">
          Want to add a quick schedule now? You can return to the import flow.
        </p>
        <button
          type="button"
          onClick={() => onChange({ scheduleDeferred: false })}
          className={cn(
            nx.primaryButton,
            "mt-6 inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-sm",
            nx.focusRing,
          )}
        >
          Add schedule now
        </button>
      </div>
    );
  }

  if (draft.importComplete) {
    const { count, warnings } = draft.importComplete;
    return (
      <div className="space-y-4">
        <div className={cn(nx.card, "p-6")}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-700/60 bg-emerald-950/50">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-[#edf2ff]">
              {count} shift{count === 1 ? "" : "s"} imported
            </span>
            <span className="rounded bg-emerald-950/70 px-2 py-0.5 text-xs text-emerald-300">
              Ready for review
            </span>
          </div>
          {warnings.length > 0 ? (
            <ul className="mt-4 space-y-1 border-t border-white/[0.06] pt-4">
              {warnings.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2 text-xs text-amber-400/95"
                >
                  <span aria-hidden>⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={resetImport}
            className={cn(
              "mt-6 w-full rounded-2xl border border-white/[0.1] py-2.5 text-sm font-medium text-[#98a4bf] transition-colors",
              "hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-[#edf2ff]",
              nx.focusRing,
            )}
          >
            Import something different
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-[22px] border border-white/[0.06] bg-[#141f42] p-1">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            draft.scheduleMode === "paste"
              ? "bg-[#45e0d4] font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.45)]"
              : "text-[#98a4bf] hover:text-[#edf2ff]",
            nx.focusRing,
          )}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors",
            draft.scheduleMode === "manual"
              ? "bg-[#45e0d4] font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.45)]"
              : "text-[#98a4bf] hover:text-[#edf2ff]",
            nx.focusRing,
          )}
        >
          Add manually
        </button>
      </div>

      {draft.scheduleMode === "paste" ? (
        <div className={cn(nx.card, "p-5 sm:p-6")}>
          <p className={nx.labelUpper}>Schedule text</p>
          <p className="mt-2 text-xs leading-relaxed text-[#7d89a6]">
            CSV format:{" "}
            <code className="rounded bg-[#0d1833] px-1 py-0.5 text-[11px] text-[#86c9ff]">
              block_type,start_ISO,end_ISO
            </code>{" "}
            e.g.{" "}
            <code className="text-[11px] text-[#98a4bf]">
              night_shift,2025-01-01T22:00:00,2025-01-02T06:00:00
            </code>
          </p>
          <textarea
            value={draft.scheduleNotes}
            onChange={(e) => onChange({ scheduleNotes: e.target.value })}
            rows={6}
            className={cn(
              "mt-4 w-full resize-y rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#7d89a6]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
            )}
            placeholder={
              "night_shift,2025-01-10T22:00:00,2025-01-11T06:00:00\nday_shift,2025-01-12T07:00:00,2025-01-12T19:00:00"
            }
          />
          <button
            type="button"
            onClick={runPasteImport}
            disabled={parsing}
            className={cn(
              nx.primaryButton,
              "mt-4 flex h-10 w-full items-center justify-center gap-2 text-sm",
              "disabled:opacity-60",
            )}
          >
            {parsing ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#04112d] border-t-transparent"
                  aria-hidden
                />
                Importing…
              </>
            ) : (
              "Parse & import"
            )}
          </button>
        </div>
      ) : (
        <div className={cn(nx.card, "p-5 sm:p-6")}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${formId}-ms-type`}
                  className="mb-1.5 block text-xs text-[#7d89a6]"
                >
                  Shift type
                </label>
                <select
                  id={`${formId}-ms-type`}
                  value={msType}
                  onChange={(e) =>
                    setMsType(e.target.value as ManualShiftDraft["type"])
                  }
                  className={cn(
                    "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2 text-sm text-[#edf2ff]",
                    "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  )}
                >
                  <option value="day_shift">Day shift</option>
                  <option value="night_shift">Night shift</option>
                  <option value="evening_shift">Evening shift</option>
                  <option value="day_off">Day off</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor={`${formId}-title`}
                  className="mb-1.5 block text-xs text-[#7d89a6]"
                >
                  Title (optional)
                </label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ICU Ward A"
                  className={cn(
                    "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2 text-sm text-[#edf2ff] placeholder:text-[#7d89a6]",
                    "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor={`${formId}-date`}
                  className="mb-1.5 block text-xs text-[#7d89a6]"
                >
                  Date
                </label>
                <input
                  id={`${formId}-date`}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2 text-sm text-[#edf2ff]",
                    "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor={`${formId}-start`}
                  className="mb-1.5 block text-xs text-[#7d89a6]"
                >
                  Start
                </label>
                <input
                  id={`${formId}-start`}
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2 text-sm text-[#edf2ff]",
                    "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor={`${formId}-end`}
                  className="mb-1.5 block text-xs text-[#7d89a6]"
                >
                  End
                </label>
                <input
                  id={`${formId}-end`}
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className={cn(
                    "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2 text-sm text-[#edf2ff]",
                    "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  )}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addManualRow}
              className={cn(
                "rounded-xl border border-white/[0.12] bg-[#16264a] px-4 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#141f42]",
                nx.focusRing,
              )}
            >
              Add shift
            </button>
          </div>

          {draft.manualShifts.length > 0 ? (
            <div className="mt-6 border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7d89a6]">
                Added shifts
              </p>
              <ul className="space-y-2">
                {draft.manualShifts.map((sh) => (
                  <li
                    key={sh.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#101c3c]/60 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 text-[#98a4bf]">
                      <span className="rounded border border-white/[0.08] bg-[#0c1f3d]/80 px-1.5 py-0.5 text-xs text-[#86c9ff]">
                        {sh.type.replace(/_/g, " ")}
                      </span>{" "}
                      <span className="text-[#edf2ff]">{sh.date}</span>
                      <span className="text-[#7d89a6]"> · </span>
                      {sh.start}–{sh.end}
                      {sh.title ? (
                        <span className="text-[#7d89a6]"> · {sh.title}</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveShift(sh.id)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs text-[#98a4bf] hover:bg-white/[0.06] hover:text-red-300"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={runManualImport}
            disabled={draft.manualShifts.length === 0 || manualImporting}
            className={cn(
              nx.primaryButton,
              "mt-6 flex h-11 w-full items-center justify-center gap-2 text-sm",
              draft.manualShifts.length === 0 && "opacity-50",
            )}
          >
            {manualImporting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#04112d] border-t-transparent"
                  aria-hidden
                />
                Importing…
              </>
            ) : (
              `Import ${draft.manualShifts.length} shift${draft.manualShifts.length === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/35 px-3 py-2.5 text-sm text-red-200"
        >
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </div>
      ) : null}

      <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-white/[0.08] bg-[#141f42]/60 px-4 py-4">
        <input
          type="checkbox"
          checked={draft.scheduleDeferred}
          onChange={(e) => {
            const on = e.target.checked;
            onChange({
              scheduleDeferred: on,
              importComplete: on ? null : draft.importComplete,
            });
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#45e0d4]"
        />
        <span className="text-sm text-[#98a4bf]">
          <span className="font-medium text-[#edf2ff]">
            I’ll set up my schedule in the app next
          </span>
          <span className="mt-1 block text-xs text-[#7d89a6]">
            Skip importing for now — you can paste or add shifts from Schedule
            later.
          </span>
        </span>
      </label>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl border border-emerald-700/60 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-100 shadow-2xl"
        >
          Schedule imported successfully
        </div>
      ) : null}
    </div>
  );
}
