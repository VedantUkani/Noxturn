"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { strainScoreHue } from "@/components/week/week-risk-meta";
import { cn } from "@/lib/utils";

type WeeklySummaryCardProps = {
  data: Pick<
    CircadianInjuryMapData,
    | "weekLabel"
    | "circadianStrainScore"
    | "summaryLine"
    | "weekDifficultyLine"
  >;
  className?: string;
};

export function WeeklySummaryCard({ data, className }: WeeklySummaryCardProps) {
  const score = data.circadianStrainScore;
  const difficulty = data.weekDifficultyLine;

  return (
    <section
      aria-labelledby="week-summary-title"
      className={cn(
        "rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#141f42] via-[#121c3d] to-[#101c3c] p-6 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="min-w-0 flex-1 space-y-4">
          <h2 id="week-summary-title" className="sr-only">
            Weekly summary
          </h2>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
            {data.weekLabel}
          </p>
          <p className="text-[15px] leading-relaxed text-[#98a4bf]">
            {data.summaryLine}
          </p>
          {difficulty ? (
            <p className="border-l-2 border-[#45e0d4]/35 pl-4 text-sm leading-relaxed text-[#b8c2d9]">
              {difficulty}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 rounded-2xl bg-[#0c1734]/80 px-6 py-5 ring-1 ring-white/[0.06] sm:px-8 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
            Weekly strain
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-1.5">
            <span
              className={cn(
                "text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl",
                strainScoreHue(score),
              )}
            >
              {score}
            </span>
            <span className="pb-2 text-sm font-medium text-[#7d89a6]">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-[#7d89a6]">Circadian load index</p>
        </div>
      </div>
    </section>
  );
}
