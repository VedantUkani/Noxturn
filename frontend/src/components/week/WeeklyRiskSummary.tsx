"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { strainScoreHue } from "./week-risk-meta";
import { cn } from "@/lib/utils";

type WeeklyRiskSummaryProps = {
  data: Pick<
    CircadianInjuryMapData,
    "circadianStrainScore" | "summaryLine" | "weekLabel"
  >;
  className?: string;
};

export function WeeklyRiskSummary({ data, className }: WeeklyRiskSummaryProps) {
  const score = data.circadianStrainScore;

  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/[0.06] bg-gradient-to-br from-[#141f42] to-[#101c3c] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] sm:p-8",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]">
        {data.weekLabel}
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <span
          className={cn(
            "text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl",
            strainScoreHue(score),
          )}
        >
          {score}
        </span>
        <span className="pb-1.5 text-sm font-medium text-[#7d89a6]">/ 100</span>
      </div>
      <p className="mt-1 text-xs text-[#7d89a6]">Circadian strain index</p>
      <p className="mt-5 max-w-xl text-[15px] leading-[1.65] text-[#98a4bf]">
        {data.summaryLine}
      </p>
    </div>
  );
}
