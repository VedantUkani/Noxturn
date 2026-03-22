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
        "relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-[#0f1a38]/90 to-[#0c152e]/95 p-5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] sm:p-6 md:p-7",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#45e0d4]/45 to-transparent sm:inset-x-12"
        aria-hidden
      />

      <div className="relative mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="week-visual-title"
            className="text-lg font-semibold tracking-tight text-[#edf2ff] sm:text-xl"
          >
            Your week
          </h2>
          <p
            id="week-visual-desc"
            className="mt-0.5 text-[13px] leading-snug text-[#7d89a6]"
          >
            Tap a day — the detail panel follows on the right.
          </p>
        </div>
      </div>

      <WeekOverviewGrid
        data={data}
        selectedDayKey={selectedDayKey}
        onSelectDay={onSelectDay}
      />
    </section>
  );
}
