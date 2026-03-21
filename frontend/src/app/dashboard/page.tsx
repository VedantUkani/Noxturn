"use client";

import { useState } from "react";

import { getJson, postJson } from "@/lib/api";

type Task = {
  id: string;
  title: string;
  anchor_flag: boolean;
  status: "planned" | "completed" | "skipped" | "expired";
};

type PlanResponse = {
  plan_mode: string;
  next_best_action: { title: string; why_now: string };
  avoid_list: string[];
  tasks: Task[];
};

type DashboardResponse = PlanResponse & {
  plan_mode: string;
  recovery_rhythm_label: string;
  recovery_score?: number | null;
  next_best_action: { title: string; why_now: string };
  anchor_tasks: Task[];
};

type RiskResponse = {
  risk_episodes: Array<{ start_time: string; severity: "low" | "moderate" | "high" | "critical"; label: string }>;
};

type WearableResponse = {
  recovery_score: number;
  sleep_hrs: number;
};

type RagResult = {
  id: string;
  title?: string;
  name?: string;
  content?: string;
  evidence_note?: string;
  score: number;
};

type RagResponse = {
  cards: RagResult[];
  evidence: RagResult[];
};

export default function DashboardPage() {
  const demoBlocks = [
    {
      block_type: "night_shift",
      title: "Night 1",
      start_time: "2026-03-21T19:00:00",
      end_time: "2026-03-22T07:00:00",
      commute_before_minutes: 45,
      commute_after_minutes: 45,
    },
    {
      block_type: "night_shift",
      title: "Night 2",
      start_time: "2026-03-22T19:00:00",
      end_time: "2026-03-23T07:00:00",
      commute_before_minutes: 45,
      commute_after_minutes: 45,
    },
    {
      block_type: "day_shift",
      title: "Day Flip",
      start_time: "2026-03-23T15:00:00",
      end_time: "2026-03-23T23:00:00",
      commute_before_minutes: 45,
      commute_after_minutes: 45,
    },
  ];

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [weeklyRisk, setWeeklyRisk] = useState<Record<string, { severity: string; label: string }>>({});
  const [sleepHrs, setSleepHrs] = useState(4.2);
  const [restlessness, setRestlessness] = useState(34);
  const [restingHr, setRestingHr] = useState(72);
  const [wearable, setWearable] = useState<WearableResponse | null>(null);
  const [lensOpen, setLensOpen] = useState(false);
  const [lensTaskTitle, setLensTaskTitle] = useState("");
  const [lensReason, setLensReason] = useState("");
  const [lensSnippet, setLensSnippet] = useState("");
  const [lensConfidence, setLensConfidence] = useState<"high" | "medium" | "low">("low");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDemoPlan() {
    try {
      setError(null);
      const p = await postJson<PlanResponse>("/plans/generate", {
        blocks: demoBlocks,
        commute_minutes: 45,
        plan_hours: 48,
      });
      setPlan(p);
      setToast("Plan generated");

      const risks = await postJson<RiskResponse>("/risks/compute", {
        blocks: demoBlocks,
        commute_minutes: 45,
      });
      const byDate: Record<string, { severity: string; label: string }> = {};
      risks.risk_episodes.forEach((ep) => {
        const d = ep.start_time.slice(0, 10);
        const prev = byDate[d];
        if (!prev || severityRank(ep.severity) > severityRank(prev.severity)) {
          byDate[d] = { severity: ep.severity, label: ep.label };
        }
      });
      setWeeklyRisk(byDate);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function loadDashboard() {
    try {
      setError(null);
      const resp = await getJson<DashboardResponse>("/dashboard/today");
      setData(resp);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function updateTask(taskId: string, status: "completed" | "skipped") {
    try {
      setError(null);
      const ev = await postJson<{ trigger_replan: boolean }>("/tasks/event", { task_id: taskId, status });
      if (ev.trigger_replan) {
        const rep = await postJson<{ updated_plan: PlanResponse }>("/plans/replan", {
          blocks: demoBlocks,
          commute_minutes: 45,
          trigger: "task_event",
          task_event: { task_id: taskId, status },
        });
        setPlan(rep.updated_plan);
        setToast("Plan updated after anchor miss");
      } else {
        setToast("Task updated");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function importWearable() {
    try {
      setError(null);
      const now = new Date();
      const start = new Date(now.getTime() - sleepHrs * 60 * 60 * 1000);
      const w = await postJson<WearableResponse>("/wearables/import", {
        sleep_hrs: sleepHrs,
        sleep_start: start.toISOString(),
        sleep_end: now.toISOString(),
        restlessness,
        resting_hr: restingHr,
      });
      setWearable(w);
      setToast("Wearable imported");
      await loadDashboard();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function openEvidenceLens(task: Task) {
    try {
      setError(null);
      const rag = await getJson<RagResponse>(
        `/rag/retrieve?query=${encodeURIComponent(task.title + " shift recovery")}&top_k=1`,
      );
      const best = rag.evidence[0] || rag.cards[0];
      const score = best?.score ?? 0;
      setLensTaskTitle(task.title);
      setLensReason(`Suggested because this task supports your current risk profile and plan mode.`);
      setLensSnippet(best?.content || best?.evidence_note || "No evidence snippet available.");
      setLensConfidence(score >= 0.75 ? "high" : score >= 0.45 ? "medium" : "low");
      setLensOpen(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const modeColor =
    (data?.plan_mode || plan?.plan_mode) === "protect"
      ? "bg-red-100 text-red-700"
      : (data?.plan_mode || plan?.plan_mode) === "recover"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex gap-3">
        <button className="rounded bg-black px-4 py-2 text-white" onClick={createDemoPlan}>
          Generate Demo Plan
        </button>
        <button className="rounded border px-4 py-2" onClick={loadDashboard}>
          Load Dashboard
        </button>
      </div>
      {toast && <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">{toast}</p>}
      {error && <p className="text-red-600">{error}</p>}
      <section className="rounded border p-4">
        <h2 className="mb-3 font-semibold">Weekly Risk Map</h2>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = `2026-03-${String(21 + i).padStart(2, "0")}`;
            const risk = weeklyRisk[day];
            const color = !risk
              ? "bg-green-100 text-green-700"
              : risk.severity === "critical" || risk.severity === "high"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700";
            return (
              <div key={day} className={`rounded p-2 ${color}`} title={risk ? risk.label : "low risk"}>
                <div>{day.slice(8)}</div>
                <div>{risk ? risk.label.replace("_", " ") : "ok"}</div>
              </div>
            );
          })}
        </div>
      </section>
      {(data || plan) && (
        <section className="rounded border p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${modeColor}`}>
              {(data?.plan_mode || plan?.plan_mode || "stabilize").toUpperCase()}
            </span>
            <span className="text-sm text-zinc-600">
              {data?.recovery_rhythm_label ? `Recovery rhythm: ${data.recovery_rhythm_label}` : "Recovery rhythm pending"}
            </span>
          </div>
          <h2 className="text-lg font-semibold">Next best action</h2>
          <p className="font-medium">{data?.next_best_action.title || plan?.next_best_action.title}</p>
          <p className="text-sm text-zinc-600">{data?.next_best_action.why_now || plan?.next_best_action.why_now}</p>
          <h3 className="mt-4 font-semibold">Anchor tasks</h3>
          <div className="mt-2 flex flex-col gap-2">
            {(plan?.tasks || data?.anchor_tasks || []).filter((t) => t.anchor_flag).map((t) => (
              <div key={t.id} className="rounded border p-3">
                <p className="font-medium">{t.title}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                    onClick={() => updateTask(t.id, "completed")}
                  >
                    Complete
                  </button>
                  <button
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                    onClick={() => updateTask(t.id, "skipped")}
                  >
                    Skip
                  </button>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => openEvidenceLens(t)}
                  >
                    Evidence Lens
                  </button>
                </div>
              </div>
            ))}
          </div>
          {plan?.avoid_list?.length ? (
            <>
              <h3 className="mt-4 font-semibold">Avoid list</h3>
              <ul className="list-disc pl-5 text-sm text-zinc-700">
                {plan.avoid_list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      )}
      <section className="rounded border p-4">
        <h2 className="mb-3 text-lg font-semibold">Wearable import</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Sleep hours
            <input
              type="number"
              step="0.1"
              min="0"
              max="12"
              value={sleepHrs}
              onChange={(e) => setSleepHrs(Number(e.target.value))}
              className="rounded border px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Restlessness
            <input
              type="range"
              min="0"
              max="100"
              value={restlessness}
              onChange={(e) => setRestlessness(Number(e.target.value))}
            />
            <span>{restlessness}</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Resting HR
            <input
              type="number"
              min="40"
              max="120"
              value={restingHr}
              onChange={(e) => setRestingHr(Number(e.target.value))}
              className="rounded border px-2 py-1"
            />
          </label>
        </div>
        <button className="mt-3 rounded bg-black px-4 py-2 text-white" onClick={importWearable}>
          Import wearable summary
        </button>
        {wearable && (
          <p className="mt-2 text-sm text-zinc-700">
            Recovery score: <span className="font-semibold">{wearable.recovery_score}</span> from {wearable.sleep_hrs}h sleep.
          </p>
        )}
      </section>
      {data && (
        <pre className="overflow-auto rounded border bg-zinc-50 p-3 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      {lensOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setLensOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Evidence Lens</h3>
              <button className="rounded border px-2 py-1 text-sm" onClick={() => setLensOpen(false)}>
                Close
              </button>
            </div>
            <p className="text-sm font-medium">{lensTaskTitle}</p>
            <p className="mt-2 text-sm text-zinc-700">{lensReason}</p>
            <p className="mt-3 rounded border bg-zinc-50 p-3 text-sm">{lensSnippet}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
              Confidence: <span className="font-semibold">{lensConfidence}</span>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function severityRank(sev: string): number {
  if (sev === "critical") return 4;
  if (sev === "high") return 3;
  if (sev === "moderate") return 2;
  return 1;
}
