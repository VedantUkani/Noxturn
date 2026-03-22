"use client";

import type { WeekDayColumn } from "@/lib/week-risk-view-model";
import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { cn } from "@/lib/utils";
import { WEEK_RISK_TITLES, severityDotClass } from "./week-risk-meta";

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

type DayContextPanelProps = {
  day: WeekDayColumn | null;
  episodesForDay: WeekRiskEpisodeVM[];
  onPickEpisode: (id: string) => void;
  selectedEpisodeId: string | null;
  className?: string;
};

export function DayContextPanel({
  day,
  episodesForDay,
  onPickEpisode,
  selectedEpisodeId,
  className,
}: DayContextPanelProps) {
  const selectedEpisode = selectedEpisodeId
    ? episodesForDay.find((e) => e.id === selectedEpisodeId)
    : undefined;

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

  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/[0.06] bg-[#141f42]/90 p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#edf2ff]">
            {day.weekdayLabel}{" "}
            <span className="font-normal text-[#98a4bf]">{day.dateLabel}</span>
          </p>
        </div>
        {day.dayStrainHint != null ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
              Load
            </p>
            <p className="text-lg font-semibold tabular-nums text-[#f7c22c]/90">
              {day.dayStrainHint}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-medium text-[#98a4bf]">On the calendar</p>
        {day.shifts.length === 0 ? (
          <p className="text-sm text-[#7d89a6]">Nothing starting this day.</p>
        ) : (
          <ul className="space-y-2">
            {day.shifts.map((s) => (
              <li
                key={s.id}
                className="rounded-lg bg-[#101c3c]/80 px-3 py-2.5 text-sm text-[#98a4bf] ring-1 ring-white/[0.04]"
              >
                <span className="font-medium text-[#edf2ff]">{s.title}</span>
                <span className="mt-1 block text-xs text-[#7d89a6]">
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

      <div className="mt-8 space-y-3">
        <p className="text-xs font-medium text-[#98a4bf]">Risks this day</p>
        {episodesForDay.length === 0 ? (
          <p className="text-sm text-[#7d89a6]">No risk windows touch this day.</p>
        ) : (
          <ul className="space-y-2">
            {episodesForDay.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onPickEpisode(e.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    selectedEpisodeId === e.id
                      ? "bg-[#0c2a3d]/90 text-[#edf2ff] ring-1 ring-[#45e0d4]/35"
                      : "bg-[#101c3c]/50 text-[#98a4bf] ring-1 ring-white/[0.04] hover:bg-[#141f42] hover:text-[#edf2ff]",
                  )}
                >
                  <span
                    className={cn(
                      "mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle",
                      severityDotClass(e.severity),
                    )}
                    aria-hidden
                  />
                  <span className="font-medium text-[#edf2ff]">
                    {WEEK_RISK_TITLES[e.label]}
                  </span>
                  <span className="mt-1 block pl-4 text-xs leading-snug text-[#7d89a6]">
                    {e.headline}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedEpisode ? (
        <div className="mt-6 rounded-lg bg-[#0c2a3d]/40 px-4 py-4 ring-1 ring-[#45e0d4]/18">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#45e0d4]/90">
            Why it matters
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#98a4bf]">
            {selectedEpisode.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
