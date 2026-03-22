import { CircularSafetyScore } from "./CircularSafetyScore";
import { ImpactComparisonBox } from "./ImpactComparisonBox";

type StrainImpactCardProps = {
  title: string;
  safetyScore: number;
  ringFillPercent: number;
  safetyScoreLabel: string;
  currentScore: number;
  scenarioScore: number;
  circadianDebtLine: string;
};

export function StrainImpactCard({
  title,
  safetyScore,
  ringFillPercent,
  safetyScoreLabel,
  currentScore,
  scenarioScore,
  circadianDebtLine,
}: StrainImpactCardProps) {
  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#141f42] via-[#101c3c] to-[#0c1734] p-7 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.95)]">
      <h2 className="text-center text-lg font-bold tracking-tight text-[#edf2ff]">
        {title}
      </h2>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center py-2">
        <CircularSafetyScore
          score={safetyScore}
          ringFillPercent={ringFillPercent}
          label={safetyScoreLabel}
        />
      </div>

      <div className="mt-6">
        <ImpactComparisonBox
          currentScore={currentScore}
          scenarioScore={scenarioScore}
          circadianDebtLine={circadianDebtLine}
        />
      </div>
    </section>
  );
}
