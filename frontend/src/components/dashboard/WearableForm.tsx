"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, RangeInput } from "@/components/ui/Input";
import { type WearableResponse } from "@/lib/types";
import { useA11y } from "@/contexts/AccessibilityContext";

type Props = {
  onImport: (data: { sleepHrs: number; restlessness: number; restingHr: number }) => Promise<WearableResponse | void>;
};

export function WearableForm({ onImport }: Props) {
  const { t } = useA11y();
  const [sleepHrs, setSleepHrs]       = useState(6.5);
  const [restlessness, setRestlessness] = useState(20);
  const [restingHr, setRestingHr]     = useState(62);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<WearableResponse | null>(null);

  async function handleImport() {
    setLoading(true);
    try {
      const r = await onImport({ sleepHrs, restlessness, restingHr });
      if (r) setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>{t("dashboard", "wearableImport")}</CardTitle>
      </CardHeader>

      <div className="space-y-4">
        <Input
          label={t("dashboard", "sleepHours")}
          type="number"
          step={0.1}
          min={0}
          max={12}
          value={sleepHrs}
          onChange={(e) => setSleepHrs(Number(e.target.value))}
        />

        <RangeInput
          label={t("dashboard", "restlessness")}
          value={restlessness}
          min={0}
          max={100}
          onChange={setRestlessness}
        />

        <Input
          label={t("dashboard", "restingHR")}
          type="number"
          min={40}
          max={120}
          value={restingHr}
          onChange={(e) => setRestingHr(Number(e.target.value))}
        />

        <Button
          variant="secondary"
          size="sm"
          fullWidth
          loading={loading}
          onClick={handleImport}
        >
          {t("dashboard", "importWearable")}
        </Button>

        {result && (
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 px-3 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 mb-0.5">{t("dashboard", "recoveryScore")}</p>
              <p className="text-2xl font-bold text-slate-100">{Math.round(result.recovery_score)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Sleep</p>
              <p className="text-sm font-semibold text-slate-300">{result.sleep_hrs.toFixed(1)}h</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
