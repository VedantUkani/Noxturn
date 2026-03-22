"use client";

import { useMemo } from "react";
import type {
  CircadianInjuryMapData,
  WeekDayColumn,
  WeekShiftSegment,
} from "@/lib/week-risk-view-model";
import { episodeTouchesDay } from "@/lib/week-timeline-math";
import { blockTypeClasses } from "./week-risk-meta";
import { cn } from "@/lib/utils";

function formatShortTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function WeekOverviewDayCard({
  day,
  shiftsForDay,
  selected,
  onSelectDay,
}: {
  day: WeekDayColumn;
  shiftsForDay: WeekShiftSegment[];
  selected: boolean;
  onSelectDay: (k: string) => void;
}) {
  const shiftsShow = shiftsForDay.slice(0, 2);
  const shiftMore = shiftsForDay.length - shiftsShow.length;

  return (
    <div
      className={cn(
        "flex min-h-[128px] flex-col rounded-2xl border bg-[#0a1228]/60 transition-all duration-200",
        selected
          ? "border-[#45e0d4]/45 bg-[#0a1f30]/55 shadow-[0_0_0_1px_rgba(69,224,212,0.12),0_16px_48px_-20px_rgba(69,224,212,0.2)]"
          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-[#0a1228]/80",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectDay(day.dayKey)}
        className="flex w-full flex-1 flex-col rounded-2xl p-3.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45e0d4]/55"
      >
        <div className="flex items-baseline justify-between gap-2 border-b border-white/[0.06] pb-2.5">
          <span className="text-[15px] font-semibold tracking-tight text-[#edf2ff]">
            {day.weekdayLabel}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-[#7d89a6]">
            {day.dateLabel}
          </span>
        </div>

        <div className="mt-2.5 min-h-[2.75rem] flex-1 space-y-1.5">
          {shiftsShow.length === 0 ? (
            <p className="text-[11px] leading-snug text-[#5c657c]">Off / no start</p>
          ) : (
            shiftsShow.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "truncate rounded-md px-2 py-1 text-[10px] font-medium leading-tight",
                  blockTypeClasses(s.blockType, s.kind),
                )}
              >
                <span className="tabular-nums opacity-90">
                  {formatShortTime(s.startTime)}
                </span>
                <span className="text-white/50"> · </span>
                <span>{s.title}</span>
              </div>
            ))
          )}
          {shiftMore > 0 ? (
            <p className="text-[10px] font-medium text-[#45e0d4]/80">
              +{shiftMore} more
            </p>
          ) : null}
        </div>
      </button>
    </div>
  );
}

function WeekColorKey() {
  const items = [
    { cls: blockTypeClasses("day_shift", "shift"), label: "Day / eve" },
    { cls: blockTypeClasses("night_shift", "shift"), label: "Night" },
    { cls: blockTypeClasses("transition_day", "obligation"), label: "Fixed" },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-white/[0.08] pt-4 text-[10px] text-[#7d89a6]"
      id="week-legend"
    >
      {items.map((it, i) => (
        <span key={it.label} className="inline-flex items-center gap-2">
          {i > 0 ? (
            <span className="mx-2 text-white/[0.15]" aria-hidden>
              ·
            </span>
          ) : null}
          <span
            className={cn("h-2 w-5 shrink-0 rounded-sm ring-1", it.cls)}
            aria-hidden
          />
          <span className="text-[#98a4bf]">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

type WeekOverviewGridProps = {
  data: CircadianInjuryMapData;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  className?: string;
};

export function WeekOverviewGrid({
  data,
  selectedDayKey,
  onSelectDay,
  className,
}: WeekOverviewGridProps) {
  const shiftsUnique = useMemo(() => {
    const m = new Map<string, (typeof data.days)[0]["shifts"][0]>();
    for (const col of data.days) {
      for (const s of col.shifts) m.set(s.id, s);
    }
    return [...m.values()];
  }, [data]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-3">
        {data.days.map((day: WeekDayColumn) => (
          <WeekOverviewDayCard
            key={day.dayKey}
            day={day}
            shiftsForDay={shiftsUnique.filter((s) =>
              episodeTouchesDay(s.startTime, s.endTime, day.dayKey),
            )}
            selected={selectedDayKey === day.dayKey}
            onSelectDay={onSelectDay}
          />
        ))}
      </div>

      <WeekColorKey />
    </div>
  );
}
