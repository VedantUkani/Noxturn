"use client";

import { useTodayDashboardContext } from "@/contexts/TodayDashboardContext";
import { TodayAvoidanceBlock } from "@/components/features/today-plan/TodayAvoidanceBlock";
import { TodayRecommendationsRow } from "@/components/features/today-plan/TodayRecommendationsRow";
import { LiveSyncRecoveryCard } from "@/components/features/today-plan/LiveSyncRecoveryCard";
import { HeroActionCard } from "@/components/features/today-plan/HeroActionCard";
import { todayHeroRowClass, todaySectionStack } from "@/components/features/today-plan/today-surfaces";
import { PlanUpdateBanner } from "./PlanUpdateBanner";
import { WhatChangedPanel } from "./WhatChangedPanel";
import { DashboardTaskSections } from "./DashboardTaskSections";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { cn } from "@/lib/utils";

export function TodayDashboardView() {
  const d = useTodayDashboardContext();
  const detailTask =
    d.detailTaskId === null
      ? null
      : d.tasks.find((t) => t.id === d.detailTaskId) ?? null;

  return (
    <div className={todaySectionStack}>
      {d.banner ? (
        <PlanUpdateBanner
          message={d.banner.message}
          why={d.banner.why}
          tone={d.banner.tone ?? "strong"}
          onDismiss={d.dismissPlanBanner}
        />
      ) : null}

      <WhatChangedPanel items={d.whatChanged} />

      <div className={todayHeroRowClass}>
        <HeroActionCard
          eyebrow={d.nextBest.eyebrow}
          titleLine1={d.nextBest.titleLine1}
          titleLine2={d.nextBest.titleLine2}
          body={d.nextBest.body}
          primaryCta={d.nextBest.primaryCta}
          secondaryCta={d.nextBest.secondaryCta}
          changeHint={d.heroChangeHint}
          onPrimaryClick={d.startNextBest}
          onSecondaryClick={d.remindNextBest}
          className={cn(
            d.pulse && "animate-reweave-emphasis ring-1 ring-[#45e0d4]/30",
          )}
        />
        <LiveSyncRecoveryCard
          className={cn(
            "lg:max-w-none",
            d.pulse && "animate-reweave-emphasis ring-1 ring-[#45e0d4]/30",
          )}
          hrv={d.vitals.hrv}
          liveSync={d.vitals.liveSync}
          message={d.vitals.message}
          readinessScore={d.vitals.readinessScore}
          metricLabel={d.vitals.metricLabel}
          lastUpdatedIso={d.vitalsSyncedAt}
          recoveryBand={d.recoveryProfile}
          planRelationLine={d.planRelationLine}
          onSelectBand={d.simulateRecoveryBand}
        />
      </div>

      <DashboardTaskSections />

      <TodayRecommendationsRow items={d.recommendations} pulse={d.pulse} />

      <TodayAvoidanceBlock items={d.avoid} />

      <TaskDetailSheet
        task={detailTask}
        open={d.detailTaskId !== null}
        onClose={d.closeTaskDetail}
      />
    </div>
  );
}
