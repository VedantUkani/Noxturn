"use client";

import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";
import { WEEK_RISK_TITLES } from "./week-risk-meta";
import { cn } from "@/lib/utils";
import { WhatToAvoidSection } from "@/components/features/today-plan/WhatToAvoidSection";
import { todayAvoidanceGridClass } from "@/components/features/today-plan/today-surfaces";
import { IconWarning } from "@/components/icons/NavIcons";
import { WeekDangerCard } from "./WeekDangerCard";

type WeeklyTopDangersProps = {
  data: Pick<CircadianInjuryMapData, "topRisks">;
  className?: string;
};

export function WeeklyTopDangers({ data, className }: WeeklyTopDangersProps) {
  const dangers = data.topRisks.slice(0, 3);

  return (
    <WhatToAvoidSection
      className={cn(className)}
      tone="rose"
      titleId="week-top-dangers-title"
      title="What to avoid this week"
      contentClassName="p-6 pt-5 md:p-8 md:pt-6"
      titleIcon={
        <IconWarning className="h-[18px] w-[18px] text-rose-100/95" />
      }
    >
      <div
        className={cn(
          todayAvoidanceGridClass,
          "gap-5 lg:grid-cols-3",
        )}
      >
        {dangers.map((r, i) => (
          <WeekDangerCard
            key={`${r.label}-${i}`}
            categoryLabel={`${WEEK_RISK_TITLES[r.label]} · ${r.severity}`}
            title={r.headline}
            detail={r.detail}
          />
        ))}
      </div>
    </WhatToAvoidSection>
  );
}
