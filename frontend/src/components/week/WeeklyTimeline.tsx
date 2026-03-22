"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { HOURS_IN_WEEK, layoutWeekSegment } from "@/lib/week-timeline-math";
import { ShiftBlock } from "./ShiftBlock";
import { RiskOverlay } from "./RiskOverlay";
import { cn } from "@/lib/utils";

type WeeklyTimelineProps = {
  data: CircadianInjuryMapData;
  weekStart: Date;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  selectedEpisodeId: string | null;
  onSelectEpisode: (id: string) => void;
  /** Lighter chrome when nested inside a parent page section. */
  variant?: "standalone" | "embedded";
  className?: string;
};

export function WeeklyTimeline({
  data,
  weekStart,
  selectedDayKey,
  onSelectDay,
  selectedEpisodeId,
  onSelectEpisode,
  variant = "standalone",
  className,
}: WeeklyTimelineProps) {
  const shifts = data.days.flatMap((d) => d.shifts);
  const uniqueShifts = Array.from(new Map(shifts.map((s) => [s.id, s])).values());

  const shell =
    variant === "embedded"
      ? "overflow-hidden rounded-[22px] bg-[#141f42]/95 ring-1 ring-white/[0.06] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]"
      : "overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#141f42]/95 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.04)]";

  return (
    <div className={cn(shell, className)}>
      <div className="grid grid-cols-7 border-b border-white/[0.06] bg-[#101c3c]/90">
        {data.days.map((d) => {
          const active = selectedDayKey === d.dayKey;
          return (
            <button
              key={d.dayKey}
              type="button"
              onClick={() => onSelectDay(d.dayKey)}
              className={cn(
                "min-h-[3.25rem] border-l border-white/[0.04] px-1 py-3 text-center transition-colors first:border-l-0 sm:min-h-[3.5rem]",
                active
                  ? "bg-[#45e0d4]/[0.1] text-[#edf2ff] ring-inset ring-1 ring-[#45e0d4]/22"
                  : "text-[#98a4bf] hover:bg-white/[0.04] hover:text-[#edf2ff]",
              )}
            >
              <div className="text-[11px] font-semibold tracking-tight sm:text-xs">
                {d.weekdayLabel}
              </div>
              <div className="mt-0.5 text-[10px] text-[#7d89a6]">{d.dateLabel}</div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5 sm:px-5">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 grid grid-cols-7 opacity-30"
            aria-hidden
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "border-l border-[#45e0d4]/[0.08]",
                  i === 0 && "border-l-0",
                )}
              />
            ))}
          </div>

          <div className="relative h-28 w-full sm:h-32">
            {uniqueShifts.map((seg) => {
              const layout = layoutWeekSegment(
                weekStart,
                new Date(seg.startTime),
                new Date(seg.endTime),
                HOURS_IN_WEEK,
              );
              if (!layout) return null;
              return (
                <ShiftBlock key={seg.id} segment={seg} layout={layout} />
              );
            })}
          </div>

          <div className="relative mt-3 h-14 w-full border-t border-white/[0.05] pt-3 sm:h-[4.5rem]">
            {data.episodes.map((ep) => {
              const layout = layoutWeekSegment(
                weekStart,
                new Date(ep.startTime),
                new Date(ep.endTime),
                HOURS_IN_WEEK,
              );
              if (!layout) return null;
              return (
                <RiskOverlay
                  key={ep.id}
                  episode={ep}
                  layout={layout}
                  selected={selectedEpisodeId === ep.id}
                  onSelect={onSelectEpisode}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.05] pt-4 text-[11px] text-[#7d89a6]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-[#45e0d4]/30 bg-[#0c2a3d]/80" />
            Day / evening
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-indigo-400/30 bg-indigo-950/55" />
            Night
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-violet-400/35 bg-violet-950/50" />
            Class / fixed
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-sm border border-amber-400/35 bg-amber-500/15" />
            Risk
          </span>
        </div>
      </div>
    </div>
  );
}
