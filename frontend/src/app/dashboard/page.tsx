"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getJson, postJson } from "@/lib/api";
import { getOrCreateUserId, getStoredScheduleBlocks } from "@/lib/session";
import { supabase, signOut } from "@/lib/supabase";
import {
  type PlanResponse, type DashboardResponse, type RiskResponse,
  type WearableResponse, type RagResponse, type PlanTask, type Severity,
  SEVERITY_RANK,
} from "@/lib/types";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RecoveryCard } from "@/components/dashboard/RecoveryCard";
import { PlanModeCard } from "@/components/dashboard/PlanModeCard";
import { NextActionCard } from "@/components/dashboard/NextActionCard";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { RiskCalendar } from "@/components/dashboard/RiskCalendar";
import { EvidenceModal } from "@/components/dashboard/EvidenceModal";
import { WearableForm } from "@/components/dashboard/WearableForm";
import { AvoidList } from "@/components/dashboard/AvoidList";
import { IconRefresh, IconDownload, IconAlertTriangle } from "@/components/icons";
import { useA11y } from "@/contexts/AccessibilityContext";

export default function DashboardPage() {
  const { t } = useA11y();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Auth guard — redirect to /login if not signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setUserEmail(data.session.user.email ?? null);
      }
    });
  }, [router]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const [userId]         = useState(() => typeof window === "undefined" ? "" : getOrCreateUserId());
  const [scheduleBlocks] = useState(() => typeof window === "undefined" ? [] : getStoredScheduleBlocks());
  const [commuteMinutes] = useState(() => {
    if (typeof window === "undefined") return 45;
    return getStoredScheduleBlocks()[0]?.commute_before_minutes ?? 45;
  });

  const [plan,       setPlan]       = useState<PlanResponse | null>(null);
  const [dashboard,  setDashboard]  = useState<DashboardResponse | null>(null);
  const [weeklyRisk, setWeeklyRisk] = useState<Record<string, { severity: Severity; label: string }>>({});
  const [taskLoading, setTaskLoading] = useState<string | null>(null);

  const [lensOpen,    setLensOpen]    = useState(false);
  const [lensTask,    setLensTask]    = useState<PlanTask | null>(null);
  const [lensCards,   setLensCards]   = useState<RagResponse["cards"]>([]);
  const [lensEvidence, setLensEvidence] = useState<RagResponse["evidence"]>([]);
  const [lensLoading, setLensLoading] = useState(false);

  const [genLoading,   setGenLoading]   = useState(false);
  const [dashLoading,  setDashLoading]  = useState(false);

  const [toast,     setToast]     = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
  }

  // ─── Generate plan ───
  async function generatePlan() {
    if (!userId) { setError("Session not ready. Retry in a moment."); return; }
    if (!scheduleBlocks.length) { setError("No schedule found. Complete onboarding first."); return; }
    setGenLoading(true); setError(null);
    try {
      const p = await postJson<PlanResponse>("/plans/generate", {
        user_id: userId,
        blocks: scheduleBlocks,
        commute_minutes: commuteMinutes,
        plan_hours: 48,
      });
      setPlan(p);
      showToast(t("dashboard", "planGenerated"));

      const risks = await postJson<RiskResponse>("/risks/compute", {
        user_id: userId,
        blocks: scheduleBlocks,
        commute_minutes: commuteMinutes,
      });
      const byDate: Record<string, { severity: Severity; label: string }> = {};
      risks.risk_episodes.forEach((ep) => {
        const d = ep.start_time.slice(0, 10);
        const prev = byDate[d];
        if (!prev || SEVERITY_RANK[ep.severity] > SEVERITY_RANK[prev.severity]) {
          byDate[d] = { severity: ep.severity, label: ep.label };
        }
      });
      setWeeklyRisk(byDate);
    } catch (e) {
      setError((e as Error).message);
      showToast((e as Error).message, "error");
    } finally {
      setGenLoading(false);
    }
  }

  // ─── Load dashboard ───
  async function loadDashboard() {
    if (!userId) { setError("Session not ready."); return; }
    setDashLoading(true); setError(null);
    try {
      const d = await getJson<DashboardResponse>(`/dashboard/today?user_id=${encodeURIComponent(userId)}`);
      setDashboard(d);
      showToast(t("dashboard", "dashLoaded"));
    } catch (e) {
      setError((e as Error).message);
      showToast((e as Error).message, "error");
    } finally {
      setDashLoading(false);
    }
  }

  // ─── Task events ───
  async function handleTaskEvent(taskId: string, status: "completed" | "skipped") {
    if (!userId || !scheduleBlocks.length) return;
    setTaskLoading(taskId);
    try {
      const ev = await postJson<{ trigger_replan: boolean }>("/tasks/event", {
        user_id: userId, task_id: taskId, status,
      });
      if (ev.trigger_replan) {
        const rep = await postJson<{ updated_plan: PlanResponse }>("/plans/replan", {
          user_id: userId,
          blocks: scheduleBlocks,
          commute_minutes: commuteMinutes,
          trigger: "task_event",
          task_event: { task_id: taskId, status },
        });
        setPlan(rep.updated_plan);
        showToast("Plan updated after anchor event");
      } else {
        // Update local task status
        setPlan((p) => p ? {
          ...p,
          tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status } : t),
        } : p);
        showToast(status === "completed" ? "Task marked complete" : "Task skipped");
      }
    } catch (e) {
      showToast((e as Error).message, "error");
    } finally {
      setTaskLoading(null);
    }
  }

  // ─── Evidence lens ───
  async function openEvidence(task: PlanTask) {
    setLensTask(task);
    setLensCards([]);
    setLensEvidence([]);
    setLensOpen(true);
    setLensLoading(true);
    try {
      const rag = await getJson<RagResponse>(
        `/rag/retrieve?query=${encodeURIComponent(task.title + " shift recovery circadian")}&top_k=2`,
      );
      setLensCards(rag.cards ?? []);
      setLensEvidence(rag.evidence ?? []);
    } catch {
      // non-fatal
    } finally {
      setLensLoading(false);
    }
  }

  // ─── Wearable import ───
  async function importWearable({ sleepHrs, restlessness, restingHr }: { sleepHrs: number; restlessness: number; restingHr: number }) {
    if (!userId) { showToast("Session not ready", "error"); return; }
    const now = new Date();
    const start = new Date(now.getTime() - sleepHrs * 3600 * 1000);
    const w = await postJson<WearableResponse>("/wearables/import", {
      user_id: userId,
      sleep_hrs: sleepHrs,
      sleep_start: start.toISOString(),
      sleep_end: now.toISOString(),
      restlessness,
      resting_hr: restingHr,
    });
    showToast("Wearable data imported");
    await loadDashboard();
    return w;
  }

  // ─── Derived state ───
  const activePlan = plan ?? dashboard;
  const allTasks = activePlan?.tasks ?? dashboard?.anchor_tasks ?? [];
  const anchorTasks = allTasks.filter((t) => t.anchor_flag);
  const otherTasks  = allTasks.filter((t) => !t.anchor_flag);

  const weekDates = useMemo(() => {
    if (!scheduleBlocks.length) return [];
    const sorted = [...scheduleBlocks].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const start = new Date(sorted[0].start_time);
    const day0 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(day0);
      d.setDate(day0.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [scheduleBlocks]);

  return (
    <AppShell
      title={t("dashboard", "title")}
      actions={
        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="hidden text-xs text-gray-400 sm:inline">{userEmail}</span>
          )}
          <Button variant="ghost" size="sm" onClick={loadDashboard} loading={dashLoading}>
            <IconDownload size={14} />
            <span className="hidden sm:inline">{t("actions", "load")}</span>
          </Button>
          <Button variant="primary" size="sm" onClick={generatePlan} loading={genLoading}>
            <IconRefresh size={14} />
            <span className="hidden sm:inline">{t("dashboard", "generatePlan")}</span>
            <span className="sm:hidden">{t("actions", "generate")}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      }
    >
      {/* No schedule warning */}
      {scheduleBlocks.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-950/40 border border-amber-800/50 px-4 py-3 mb-6">
          <IconAlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{t("dashboard", "noSchedule")}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-950/40 border border-red-800/50 px-4 py-3 mb-6">
          <IconAlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top row: Recovery + Plan mode */}
          <div className="grid sm:grid-cols-2 gap-4">
            <RecoveryCard
              score={dashboard?.recovery_score}
              rhythm={dashboard?.recovery_rhythm_label}
            />
            <PlanModeCard
              mode={activePlan?.plan_mode}
              strainScore={activePlan?.strain_score}
            />
          </div>

          {/* Next action */}
          <NextActionCard action={activePlan?.next_best_action} />

          {/* Anchor tasks */}
          {anchorTasks.length > 0 && (
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t("dashboard", "anchorTasks")}</CardTitle>
                <span className="text-xs text-slate-500">{anchorTasks.length} task{anchorTasks.length !== 1 ? "s" : ""}</span>
              </CardHeader>
              <div className="space-y-2">
                {anchorTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={(id) => handleTaskEvent(id, "completed")}
                    onSkip={(id) => handleTaskEvent(id, "skipped")}
                    onEvidence={openEvidence}
                    loading={taskLoading === task.id}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Other tasks */}
          {otherTasks.length > 0 && (
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t("dashboard", "allTasks")}</CardTitle>
                <span className="text-xs text-slate-500">{otherTasks.length} task{otherTasks.length !== 1 ? "s" : ""}</span>
              </CardHeader>
              <div className="space-y-2">
                {otherTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={(id) => handleTaskEvent(id, "completed")}
                    onSkip={(id) => handleTaskEvent(id, "skipped")}
                    onEvidence={openEvidence}
                    loading={taskLoading === task.id}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!activePlan && (
            <Card variant="flat" padding="lg">
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                  📋
                </div>
                <p className="text-sm font-medium text-slate-300">{t("dashboard", "noActivePlan")}</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {t("dashboard", "noActivePlanDesc")}
                </p>
                <Button variant="primary" size="sm" onClick={generatePlan} loading={genLoading}>
                  {t("dashboard", "generatePlan")}
                </Button>
              </div>
            </Card>
          )}

          {/* Risk calendar */}
          <RiskCalendar weekDates={weekDates} risks={weeklyRisk} />
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          <WearableForm onImport={importWearable} />
          {activePlan?.avoid_list?.length ? (
            <AvoidList items={activePlan.avoid_list} />
          ) : null}

          {/* Evidence refs */}
          {activePlan?.evidence_refs?.length ? (
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t("dashboard", "evidenceUsed")}</CardTitle>
              </CardHeader>
              <ul className="space-y-1.5">
                {activePlan.evidence_refs.map((ref) => (
                  <li key={ref} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-indigo-500 mt-0.5">›</span>
                    {ref}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Evidence modal */}
      <EvidenceModal
        open={lensOpen}
        onClose={() => setLensOpen(false)}
        taskTitle={lensTask?.title ?? ""}
        cards={lensCards}
        evidence={lensEvidence}
        loading={lensLoading}
      />

      {/* Toast */}
      <Toast
        message={toast?.msg ?? null}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
