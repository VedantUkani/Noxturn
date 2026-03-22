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
        "flex min-h-[140px] flex-col rounded-2xl border border-white/[0.07] bg-[#101c3c]/50 shadow-sm transition-colors",
        selected
          ? "border-[#45e0d4]/35 bg-[#0c2a3d]/40 ring-1 ring-[#45e0d4]/25"
          : "hover:border-white/[0.11]",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectDay(day.dayKey)}
        className="flex w-full flex-1 flex-col p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#45e0d4]/50"
      >
        <div>
          <p className="text-sm font-semibold text-[#edf2ff]">
            {day.weekdayLabel}
          </p>
          <p className="text-[11px] text-[#7d89a6]">{day.dateLabel}</p>
        </div>

        <div className="mt-3 min-h-[3.25rem] flex-1 space-y-1.5">
          {shiftsShow.length === 0 ? (
            <p className="text-[11px] leading-snug text-[#5c657c]">
              No shift starting this day
            </p>
          ) : (
            shiftsShow.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "truncate rounded-lg px-2 py-1 text-[10px] font-medium leading-tight ring-1 ring-white/[0.06]",
                  blockTypeClasses(s.blockType, s.kind),
                )}
              >
                <span className="opacity-80">
                  {formatShortTime(s.startTime)}
                </span>{" "}
                · {s.title}
              </div>
            ))
          )}
          {shiftMore > 0 ? (
            <p className="text-[10px] text-[#7d89a6]">+{shiftMore} more</p>
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
      className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-[10px] text-[#98a4bf]"
      id="week-legend"
    >
      <span className="font-medium text-[#7d89a6]">Shift colors</span>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-2">
          <span
            className={cn("h-2.5 w-6 shrink-0 rounded-sm ring-1", it.cls)}
            aria-hidden
          />
          {it.label}
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
    <div className={cn("space-y-5", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-3">
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
