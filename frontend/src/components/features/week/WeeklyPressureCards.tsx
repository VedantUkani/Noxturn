"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { WEEK_RISK_TITLES } from "@/components/week/week-risk-meta";
import { WeeklyPressureCard } from "./WeeklyPressureCard";
import { cn } from "@/lib/utils";

type WeeklyPressureCardsProps = {
  data: Pick<CircadianInjuryMapData, "topRisks">;
  className?: string;
};

export function WeeklyPressureCards({ data, className }: WeeklyPressureCardsProps) {
  const pressures = data.topRisks.slice(0, 3);

  return (
    <section
      className={cn("space-y-5", className)}
      aria-labelledby="week-pressures-title"
    >
      <div className="max-w-2xl space-y-1">
        <h2
          id="week-pressures-title"
          className="text-base font-semibold tracking-tight text-[#edf2ff]"
        >
          What to ease up on
        </h2>
        <p className="text-sm leading-relaxed text-[#98a4bf]">
          The few schedule pressures worth knowing about — not a to-do list, just
          context.
        </p>
      </div>

      {pressures.length === 0 ? (
        <p className="rounded-[22px] border border-white/[0.06] bg-[#141f42]/40 px-5 py-6 text-sm text-[#98a4bf]">
          No major schedule pressures were flagged for this week.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {pressures.map((r, i) => (
            <WeeklyPressureCard
              key={`${r.label}-${i}`}
              index={i + 1}
              categoryLabel={WEEK_RISK_TITLES[r.label]}
              title={r.headline}
              detail={r.detail}
            />
          ))}
        </div>
      )}
    </section>
  );
}
