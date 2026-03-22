"use client";

import { useMemo, useState } from "react";
import { CurrentScheduleCard } from "./CurrentScheduleCard";
import { MetricStatCard } from "./MetricStatCard";
import { MitigationPlanCard } from "./MitigationPlanCard";
import { SandboxHeader } from "./SandboxHeader";
import { StrainImpactCard } from "./StrainImpactCard";
import type { CircadianSandboxViewModel } from "./types";

type CircadianSandboxViewProps = {
  model: CircadianSandboxViewModel;
};

/** Sandbox scenario UI — sidebar/top bar come from the shared dashboard shell. */
export function CircadianSandboxView({ model }: CircadianSandboxViewProps) {
  const [scenarioId, setScenarioId] = useState(model.defaultScenarioId);

  const scenario = useMemo(() => {
    return (
      model.scenarioOptions.find((s) => s.id === scenarioId) ??
      model.scenarioOptions[0]
    );
  }, [model.scenarioOptions, scenarioId]);

  const strain = scenario.strain;

  return (
    <div className="relative w-full">
      <SandboxHeader
        title={model.heading.title}
        description={model.heading.description}
        healthStatus={model.healthStatus}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(260px,300px)] lg:items-stretch">
        <CurrentScheduleCard
          title={model.currentScheduleTitle}
          blocks={model.scheduleBlocks}
          newScenarioTitle={model.newScenarioTitle}
          targetShiftLabel={model.targetShiftLabel}
          scenarioOptions={model.scenarioOptions}
          selectedScenarioId={scenario.id}
          onScenarioChange={setScenarioId}
        />
        <StrainImpactCard
          title="Projected Strain Impact"
          safetyScore={strain.safetyScore}
          ringFillPercent={strain.ringFillPercent}
          safetyScoreLabel="SAFETY SCORE"
          currentScore={strain.currentScore}
          scenarioScore={strain.scenarioScore}
          circadianDebtLine={strain.circadianDebtLine}
        />
        <MitigationPlanCard
          title="Mitigation Plan"
          items={scenario.mitigationItems}
          acceptLabel={model.actions.acceptLabel}
          exploreLabel={model.actions.exploreLabel}
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {model.bottomMetrics.map((m) => (
          <MetricStatCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}
