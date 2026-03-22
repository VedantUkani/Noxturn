"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import {
  fetchDashboardToday,
  postPlansGenerateClaude,
  postPlansReplan,
  postTasksEvent,
} from "@/lib/noxturn-api";
import { getOrCreateUserId, getStoredScheduleBlocks } from "@/lib/session";
import { getUserProfileForApi } from "@/lib/user-profile-settings";
import { payloadFromDashboardApi } from "@/lib/mocks/today-dashboard-payload";
import type { TodayDashboardPayload } from "@/lib/dashboard-types";
import { TodayDashboardProvider } from "@/contexts/TodayDashboardContext";
import { TodayDashboardView } from "@/components/dashboard/TodayDashboardView";
import { cn } from "@/lib/utils";

const LAST_PLAN_DATE_KEY = "noxturn_last_plan_date";
const PROFILE_KEY = "noxturn_profile";

type Phase = "loading" | "generating" | "ready" | "empty" | "error";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCommuteMinutes(): number {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return 30;
    const p = JSON.parse(raw) as { commuteMinutes?: number };
    return p.commuteMinutes ?? 30;
  } catch {
    return 30;
  }
}

function filterToday(payload: TodayDashboardPayload): TodayDashboardPayload {
  const today = todayStr();
  const todayTasks = payload.tasks.filter(
    (t) => !t.scheduled_time || t.scheduled_time.slice(0, 10) === today,
  );
  // If no tasks fall on today's date (plan covers future shifts), show all tasks
  // so the user always sees their recovery plan rather than "free for the day".
  return { ...payload, tasks: todayTasks.length > 0 ? todayTasks : payload.tasks };
}

export function TodayPageClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [generateLabel, setGenerateLabel] = useState("Generating your plan with AI…");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [payload, setPayload] = useState<TodayDashboardPayload | null>(null);
  const [boot, setBoot] = useState(0);
  const cancelledRef = useRef(false);

  const applyPayload = useCallback((raw: TodayDashboardPayload) => {
    const filtered = filterToday(raw);
    setPayload(filtered);
    setBoot((k) => k + 1);
    try {
      localStorage.setItem(LAST_PLAN_DATE_KEY, todayStr());
    } catch { /* ignore */ }
    return filtered;
  }, []);

  const loadDashboard = useCallback(
    async (_userId: string): Promise<"ready" | "empty"> => {
      const d = await fetchDashboardToday();
      const raw = payloadFromDashboardApi(d);
      const filtered = applyPayload(raw);
      return filtered.tasks.length > 0 ? "ready" : "empty";
    },
    [applyPayload],
  );

  useEffect(() => {
    cancelledRef.current = false;
    const userId = getOrCreateUserId();
    if (!userId) {
      router.replace("/onboard");
      return;
    }

    void (async () => {
      const today = todayStr();

      // Check if a new day has started since the last plan
      let isNewDay = false;
      try {
        const lastDate = localStorage.getItem(LAST_PLAN_DATE_KEY);
        isNewDay = lastDate !== today;
      } catch { /* ignore */ }

      // New day: silently regenerate plan before showing dashboard
      if (isNewDay) {
        const blocks = getStoredScheduleBlocks();
        if (blocks.length > 0) {
          if (!cancelledRef.current) {
            setPhase("generating");
            setGenerateLabel("New day — refreshing your plan with AI…");
          }
          try {
            await postPlansGenerateClaude({
              user_id: userId,
              blocks,
              commute_minutes: getCommuteMinutes(),
              plan_hours: 24,
              user_profile: getUserProfileForApi(),
            });
          } catch { /* fall through — still try to load existing plan */ }
          if (cancelledRef.current) return;
        }
      }

      // Fetch dashboard
      try {
        const outcome = await loadDashboard(userId);
        if (!cancelledRef.current) setPhase(outcome);
      } catch (e) {
        if (cancelledRef.current) return;

        if (e instanceof ApiError && e.status === 404) {
          // No active plan — generate one if schedule exists
          const blocks = getStoredScheduleBlocks();
          if (blocks.length === 0) {
            setPhase("empty");
            return;
          }
          setPhase("generating");
          setGenerateLabel("Generating your plan with AI — this takes a few seconds…");
          try {
            await postPlansGenerateClaude({
              user_id: userId,
              blocks,
              commute_minutes: getCommuteMinutes(),
              plan_hours: 24,
              user_profile: getUserProfileForApi(),
            });
            if (cancelledRef.current) return;
            const outcome = await loadDashboard(userId);
            if (!cancelledRef.current) setPhase(outcome);
          } catch (genErr) {
            if (cancelledRef.current) return;
            setErrorMsg(
              genErr instanceof Error ? genErr.message : "Plan generation failed.",
            );
            setPhase("error");
          }
        } else {
          setErrorMsg(
            e instanceof Error ? e.message : "Could not load today's plan.",
          );
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [router, loadDashboard]);

  /** Called by useTodayDashboard when a task is completed or skipped. */
  const onApiTaskEvent = useCallback(
    async (taskId: string, status: "completed" | "skipped"): Promise<void> => {
      const userId = getOrCreateUserId();
      if (!userId) return;
      try {
        const result = await postTasksEvent({ user_id: userId, task_id: taskId, status });
        if (result.trigger_replan) {
          const blocks = getStoredScheduleBlocks();
          const commute = getCommuteMinutes();
          await postPlansReplan({
            user_id: userId,
            blocks,
            commute_minutes: commute,
            use_claude: true,
            task_event: { task_id: taskId, status },
          });
          await loadDashboard(userId);
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Noxturn] task event API error:", e);
        }
      }
    },
    [loadDashboard],
  );

  if (phase === "loading" || phase === "generating") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#45e0d4]/20 border-t-[#45e0d4]" />
        </div>
        <p className="max-w-xs text-center text-sm leading-relaxed text-[#98a4bf]">
          {generateLabel}
        </p>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            "bg-[#141f42] shadow-[0_0_32px_-8px_rgba(69,224,212,0.15)]",
          )}
        >
          <span className="text-3xl" aria-hidden>🌙</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#edf2ff]">
            You&apos;re clear today — rest well
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#7d89a6]">
            No tasks scheduled for today. When you have upcoming shifts, Noxturn
            will generate a personalised recovery plan automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/schedule")}
          className={cn(
            "mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold",
            "bg-[#45e0d4]/15 text-[#45e0d4] transition hover:bg-[#45e0d4]/25",
          )}
        >
          Add your schedule
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-[#f87171]">
          {errorMsg ?? "Something went wrong loading today's plan."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-white/[0.12] px-5 py-2 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.2]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!payload) return null;

  return (
    <TodayDashboardProvider
      key={boot}
      initial={payload}
      onApiTaskEvent={onApiTaskEvent}
    >
      <TodayDashboardView />
    </TodayDashboardProvider>
  );
}
