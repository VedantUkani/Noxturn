"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { RhythmBadge } from "@/components/ui/Badge";
import { type RecoveryRhythm } from "@/lib/types";
import { useA11y } from "@/contexts/AccessibilityContext";

type Props = {
  score: number | null | undefined;
  rhythm: RecoveryRhythm | null | undefined;
  sleepHrs?: number | null;
};

function scoreColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 25) return "Low";
  return "Poor";
}

export function RecoveryCard({ score, rhythm, sleepHrs }: Props) {
  const { t } = useA11y();
  const s = score ?? 0;
  const hasData = score != null;

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>{t("dashboard", "recoveryStatus")}</CardTitle>
        {rhythm && <RhythmBadge rhythm={rhythm} />}
      </CardHeader>

      <div className="flex items-center gap-6">
        <ProgressRing
          value={hasData ? s : 0}
          size={88}
          strokeWidth={7}
          color={hasData ? scoreColor(s) : "#1e293b"}
          label={hasData ? `${Math.round(s)}` : "—"}
          sublabel={hasData ? scoreLabel(s) : "—"}
        />

        <div className="flex-1 space-y-3">
          {sleepHrs != null && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Sleep</p>
              <p className="text-lg font-bold text-slate-100">{sleepHrs.toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">hrs</span></p>
            </div>
          )}
          {!hasData && (
            <p className="text-sm text-slate-500">
              Import wearable data to see your recovery score.
            </p>
          )}
          {hasData && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s}%`, backgroundColor: scoreColor(s) }}
                />
              </div>
              <p className="text-xs text-slate-500">Recovery score out of 100</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
