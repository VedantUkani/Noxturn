"use client";

import type { ReactNode } from "react";
import type { Severity } from "@/lib/types";
import type { WeekDayColumn } from "@/lib/week-risk-view-model";
import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { cn } from "@/lib/utils";
import { WEEK_RISK_TITLES } from "./week-risk-meta";

function fmtRange(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const t = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${t.format(a)}–${t.format(b)}`;
  } catch {
    return "";
  }
}

/** One narrative line per risk — avoids repeating the same text twice (headline vs explanation). */
function riskNarrative(e: WeekRiskEpisodeVM): string {
  const h = e.headline.trim();
  const x = e.explanation.trim();
  if (!x) return h;
  if (x === h) return h;
  return x;
}

function severityLeftBar(sev: Severity): string {
  switch (sev) {
    case "critical":
      return "border-l-[3px] border-l-rose-400/90";
    case "high":
      return "border-l-[3px] border-l-orange-400/85";
    case "moderate":
      return "border-l-[3px] border-l-amber-400/75";
    default:
      return "border-l-[3px] border-l-slate-500/65";
  }
}

type DayContextPanelProps = {
  day: WeekDayColumn | null;
  episodesForDay: WeekRiskEpisodeVM[];
  /** Kept for API compatibility; selection UI removed — day detail shows every risk at once. */
  onPickEpisode?: (id: string) => void;
  selectedEpisodeId?: string | null;
  className?: string;
  compact?: boolean;
  footer?: ReactNode;
};

export function DayContextPanel({
  day,
  episodesForDay,
  className,
  compact = false,
  footer,
}: DayContextPanelProps) {
  if (!day) {
    return (
      <div
        className={cn(
          "rounded-[22px] bg-[#141f42]/70 p-5 text-sm text-[#98a4bf] ring-1 ring-white/[0.06]",
          className,
        )}
      >
        Choose a day on the strip to see that day&apos;s schedule.
      </div>
    );
  }

  const n = episodesForDay.length;
  const scheduleLabel = compact ? "Schedule" : "On the calendar";
  const headsUpLabel = compact ? "Heads-up" : "Risks this day";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-[#141f42]/95 to-[#101a36]/95 p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.88)] sm:p-6",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-[#edf2ff]">
            {day.weekdayLabel}{" "}
            <span className="font-normal text-[#7d89a6]">{day.dateLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!compact && day.dayStrainHint != null ? (
            <div className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-right ring-1 ring-white/[0.06]">
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
                Load
              </p>
              <p className="text-sm font-semibold tabular-nums text-[#f7c22c]/90">
                {day.dayStrainHint}
              </p>
            </div>
          ) : null}
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1",
              n === 0
                ? "bg-[#45e0d4]/10 text-[#45e0d4]/90 ring-[#45e0d4]/20"
                : "bg-white/[0.06] text-[#98a4bf] ring-white/[0.08]",
            )}
          >
            {n === 0 ? "All clear" : `${n} heads-up${n > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {/* Schedule — same structure every day */}
      <section className="mt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
          {scheduleLabel}
        </h3>
        <div className="mt-2">
          {day.shifts.length === 0 ? (
            <p className="rounded-lg border border-white/[0.06] bg-[#101c3c]/25 px-3 py-3 text-sm text-[#7d89a6]">
              Nothing starting this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {day.shifts.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-white/[0.06] bg-[#101c3c]/40 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-[#edf2ff]">{s.title}</span>
                  <span className="mt-0.5 block text-xs text-[#7d89a6]">
                    {fmtRange(s.startTime, s.endTime)} ·{" "}
                    {s.kind === "obligation"
                      ? "Obligation"
                      : s.blockType.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Heads-up — same chrome whether empty or full */}
      <section className="mt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
          {headsUpLabel}
        </h3>
        <div className="mt-2 space-y-2">
          {n === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#101c3c]/20 px-4 py-4 text-center">
              <p className="text-sm leading-relaxed text-[#7d89a6]">
                No extra circadian flags on this day — still worth guarding sleep
                if you work nights nearby.
              </p>
            </div>
          ) : (
            episodesForDay.map((e) => (
              <div
                key={e.id}
                className={cn(
                  "rounded-xl border border-white/[0.07] bg-[#101c3c]/45 py-2.5 pl-3 pr-3",
                  severityLeftBar(e.severity),
                )}
              >
                <p className="text-sm font-semibold text-[#edf2ff]">
                  {WEEK_RISK_TITLES[e.label]}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#98a4bf]">
                  {riskNarrative(e)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {footer ? <div className="mt-5 border-t border-white/[0.08] pt-5">{footer}</div> : null}
    </div>
  );
}
