"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlanModeBadge } from "@/components/ui/Badge";
import { type PlanMode, PLAN_MODE_META } from "@/lib/types";
import { useA11y } from "@/contexts/AccessibilityContext";

type Props = {
  mode: PlanMode | null | undefined;
  strainScore?: number | null;
};

function strainColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 25) return "#f59e0b";
  return "#10b981";
}

export function PlanModeCard({ mode, strainScore }: Props) {
  const { t } = useA11y();
  const meta = mode ? PLAN_MODE_META[mode] : null;

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>{t("dashboard", "planMode")}</CardTitle>
        {mode && <PlanModeBadge mode={mode} />}
      </CardHeader>

      {meta ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">{meta.description}</p>

          {strainScore != null && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{t("dashboard", "circadianStrain")}</span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: strainColor(strainScore) }}
                >
                  {Math.round(strainScore)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${strainScore}%`,
                    backgroundColor: strainColor(strainScore),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t("dashboard", "generateMode")}</p>
      )}
    </Card>
  );
}
