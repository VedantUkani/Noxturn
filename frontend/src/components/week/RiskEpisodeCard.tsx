"use client";

import type { WeekRiskEpisodeVM } from "@/lib/week-risk-view-model";
import { cn } from "@/lib/utils";
import { WEEK_RISK_TITLES, severityDotClass } from "./week-risk-meta";

function fmtWindow(isoStart: string, isoEnd: string) {
  try {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    const d = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    return `${d.format(a)} → ${d.format(b)}`;
  } catch {
    return "";
  }
}

export function RiskEpisodeCard({
  episode,
  className,
}: {
  episode: WeekRiskEpisodeVM | null;
  className?: string;
}) {
  if (!episode) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-white/[0.1] bg-[#101c3c]/50 p-4 text-sm text-[#7d89a6]",
          className,
        )}
      >
        Select a risk band on the timeline or a day to see episode detail.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/[0.08] bg-[#141f42]/90 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            severityDotClass(episode.severity),
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#45e0d4]/90">
              {WEEK_RISK_TITLES[episode.label]}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-snug text-[#edf2ff]">
              {episode.headline}
            </h3>
          </div>
          <p className="text-[11px] leading-relaxed text-[#7d89a6]">
            {fmtWindow(episode.startTime, episode.endTime)}
          </p>
          <p className="text-sm leading-relaxed text-[#98a4bf]">
            {episode.explanation}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-md bg-[#101c3c] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
              Severity · {episode.severity}
            </span>
            <span className="rounded-md bg-[#0c2a3d]/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#45e0d4]/90">
              Suggested · {episode.recommendationCategory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
