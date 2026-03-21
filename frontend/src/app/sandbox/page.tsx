"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";
import { getOrCreateUserId, getStoredScheduleBlocks, type ScheduleBlockInput } from "@/lib/session";
import { type SandboxResponse } from "@/lib/types";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { IconAlertTriangle, IconZap, IconTrendUp, IconTrendDown } from "@/components/icons";

type BlockType = "day_shift" | "night_shift" | "evening_shift";

const VERDICTS: Record<string, { color: string; bg: string; icon: string }> = {
  dangerous:  { color: "text-red-300",    bg: "bg-red-950/50 border-red-800/50",    icon: "🚨" },
  risky:      { color: "text-amber-300",  bg: "bg-amber-950/50 border-amber-800/50", icon: "⚠️" },
  manageable: { color: "text-emerald-300", bg: "bg-emerald-950/50 border-emerald-800/50", icon: "✓" },
};

function StrainDelta({ original, projected }: { original: number; projected: number }) {
  const delta = projected - original;
  const worse = delta > 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Current Strain</p>
        <p className="text-3xl font-bold text-slate-200 tabular-nums">{Math.round(original)}</p>
      </div>
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/30 p-4 flex items-center justify-center">
        <div className={`flex flex-col items-center gap-1 ${worse ? "text-red-400" : "text-emerald-400"}`}>
          {worse ? <IconTrendUp size={20} /> : <IconTrendDown size={20} />}
          <span className="text-sm font-bold tabular-nums">
            {delta > 0 ? "+" : ""}{Math.round(delta)}
          </span>
          <span className="text-xs">{worse ? "worse" : "better"}</span>
        </div>
      </div>
      <div className={[
        "rounded-xl border p-4 text-center",
        worse ? "bg-red-950/30 border-red-800/40" : "bg-emerald-950/30 border-emerald-800/40",
      ].join(" ")}>
        <p className="text-xs text-slate-500 mb-1">Projected Strain</p>
        <p className={`text-3xl font-bold tabular-nums ${worse ? "text-red-300" : "text-emerald-300"}`}>
          {Math.round(projected)}
        </p>
      </div>
    </div>
  );
}

export default function SandboxPage() {
  const [userId]        = useState(() => typeof window === "undefined" ? "" : getOrCreateUserId());
  const [currentBlocks] = useState<ScheduleBlockInput[]>(() =>
    typeof window === "undefined" ? [] : getStoredScheduleBlocks(),
  );
  const [commuteMinutes] = useState(() => {
    if (typeof window === "undefined") return 45;
    return getStoredScheduleBlocks()[0]?.commute_before_minutes ?? 45;
  });

  const [blockType, setBlockType] = useState<BlockType>("day_shift");
  const [title,     setTitle]     = useState("");
  const [date,      setDate]      = useState("");
  const [start,     setStart]     = useState("");
  const [end,       setEnd]       = useState("");

  const [result,  setResult]  = useState<SandboxResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [toast,   setToast]   = useState<string | null>(null);

  async function simulate() {
    if (!userId)         { setError("Session not ready."); return; }
    if (!currentBlocks.length) { setError("No current schedule found. Import schedule on Onboarding first."); return; }
    if (!date || !start || !end) { setError("Enter a full hypothetical shift (date, start, and end)."); return; }
    setLoading(true); setError(null);
    try {
      const hypo: ScheduleBlockInput = {
        block_type: blockType, title: title || "Hypothetical Shift",
        start_time: `${date}T${start}:00`,
        end_time:   `${date}T${end}:00`,
        commute_before_minutes: commuteMinutes,
        commute_after_minutes:  commuteMinutes,
      };
      const data = await postJson<SandboxResponse>("/simulate/shift-sandbox", {
        user_id: userId,
        current_blocks: currentBlocks,
        hypothetical_shifts: [hypo],
        commute_minutes: commuteMinutes,
      });
      setResult(data);
      setToast("Simulation complete");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const verdictMeta = result ? (VERDICTS[result.verdict] ?? VERDICTS.risky) : null;

  return (
    <AppShell title="Shift Sandbox">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Hypothetical shift simulator</h2>
          <p className="text-sm text-slate-400">
            Test what happens to your circadian strain if you add or swap a shift — before committing.
          </p>
        </div>

        {/* No schedule warning */}
        {currentBlocks.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-amber-950/40 border border-amber-800/50 px-4 py-3">
            <IconAlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              No schedule loaded.{" "}
              <a href="/onboard" className="underline underline-offset-2 hover:text-amber-100">Import it first</a>
              {" "}to compare against your current strain.
            </p>
          </div>
        )}

        {/* Input form */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Hypothetical shift</CardTitle>
            <Badge color="indigo" size="xs">no data saved</Badge>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Shift type"
                value={blockType}
                onChange={(e) => setBlockType(e.target.value as BlockType)}
              >
                <option value="day_shift">Day shift</option>
                <option value="night_shift">Night shift</option>
                <option value="evening_shift">Evening shift</option>
              </Select>
              <Input
                label="Title (optional)"
                placeholder="e.g. Cover shift"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Date"  type="date" value={date}  onChange={(e) => setDate(e.target.value)} />
              <Input label="Start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              <Input label="End"   type="time" value={end}   onChange={(e) => setEnd(e.target.value)} />
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={loading}
              onClick={simulate}
            >
              <IconZap size={14} />
              Run Simulation
            </Button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-950/40 border border-red-800/50 px-4 py-3">
            <IconAlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && verdictMeta && (
          <div className="space-y-4 animate-fade-in">
            {/* Verdict */}
            <div className={`rounded-xl border p-4 ${verdictMeta.bg}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{verdictMeta.icon}</span>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Verdict</p>
                  <p className={`text-lg font-bold capitalize ${verdictMeta.color}`}>{result.verdict}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Strain comparison */}
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle>Strain comparison</CardTitle>
              </CardHeader>
              <StrainDelta
                original={result.original_strain_score}
                projected={result.projected_strain_score}
              />
            </Card>

            {/* Raw numbers */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <p className="text-xs text-slate-500 mb-0.5">Current strain</p>
                <p className="text-xl font-bold text-slate-200 tabular-nums">{result.original_strain_score.toFixed(1)}</p>
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                <p className="text-xs text-slate-500 mb-0.5">Projected strain</p>
                <p className="text-xl font-bold text-slate-200 tabular-nums">{result.projected_strain_score.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  );
}
