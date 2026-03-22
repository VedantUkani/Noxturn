"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { WeekOverviewGrid } from "@/components/week/WeekOverviewGrid";
import { cn } from "@/lib/utils";

type WeeklyScheduleRiskPanelProps = {
  data: CircadianInjuryMapData;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  className?: string;
};

export function WeeklyScheduleRiskPanel({
  data,
  selectedDayKey,
  onSelectDay,
  className,
}: WeeklyScheduleRiskPanelProps) {
  return (
    <section
      aria-labelledby="week-visual-title"
      aria-describedby="week-visual-desc week-legend"
      className={cn(
        "rounded-[22px] border border-white/[0.06] bg-[#0d1833]/40 p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] sm:p-6 md:p-8",
        className,
      )}
    >
      <div className="mb-6 max-w-2xl space-y-2">
        <h2
          id="week-visual-title"
          className="text-base font-semibold tracking-tight text-[#edf2ff]"
        >
          This week
        </h2>
        <p id="week-visual-desc" className="text-sm leading-relaxed text-[#98a4bf]">
          One card per day with your shifts. Choose a day to see the full schedule
          on the right.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[#101c3c]/35 p-4 ring-1 ring-white/[0.05] sm:p-5">
        <WeekOverviewGrid
          data={data}
          selectedDayKey={selectedDayKey}
          onSelectDay={onSelectDay}
        />
      </div>
    </section>
  );
}
