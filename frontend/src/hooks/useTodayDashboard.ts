"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TodayDashboardPayload } from "@/lib/dashboard-types";
import type { RecoverySimulationBand } from "@/lib/dashboard-types";
import {
  applyLiveEvent,
  initialLiveState,
  type LiveDashboardState,
} from "@/lib/dashboard-live";

export type TodayDashboardActions = {
  completeTask: (id: string) => void;
  skipTask: (id: string) => void;
  markTaskMissed: (id: string) => void;
  snoozeTask: (id: string, minutes?: number) => void;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;
  dismissPlanBanner: () => void;
  startNextBest: () => void;
  remindNextBest: () => void;
  simulateRecoveryBand: (band: RecoverySimulationBand) => void;
};

export type TodayDashboardState = LiveDashboardState & TodayDashboardActions;

export function useTodayDashboard(
  initial: TodayDashboardPayload,
): TodayDashboardState {
  const [state, setState] = useState(() => initialLiveState(initial));

  useEffect(() => {
    if (!state.pulse) return;
    const t = window.setTimeout(() => {
      setState((s) => applyLiveEvent(s, { type: "CLEAR_PULSE" }));
    }, 2200);
    return () => window.clearTimeout(t);
  }, [state.pulse]);

  useEffect(() => {
    if (!state.heroChangeHint) return;
    const t = window.setTimeout(() => {
      setState((s) => applyLiveEvent(s, { type: "CLEAR_HERO_HINT" }));
    }, 12000);
    return () => window.clearTimeout(t);
  }, [state.heroChangeHint]);

  /** Recovery / check-in banners only — auto-clear so the feed stays readable. */
  useEffect(() => {
    if (!state.banner) return;
    const t = window.setTimeout(() => {
      setState((s) => applyLiveEvent(s, { type: "DISMISS_BANNER" }));
    }, 7000);
    return () => window.clearTimeout(t);
  }, [state.banner]);

  const dispatch = useCallback((event: Parameters<typeof applyLiveEvent>[1]) => {
    setState((s) => applyLiveEvent(s, event));
  }, []);

  const completeTask = useCallback(
    (id: string) => dispatch({ type: "TASK_COMPLETE", taskId: id }),
    [dispatch],
  );
  const skipTask = useCallback(
    (id: string) => dispatch({ type: "TASK_SKIP", taskId: id }),
    [dispatch],
  );
  const markTaskMissed = useCallback(
    (id: string) => dispatch({ type: "TASK_MISSED", taskId: id }),
    [dispatch],
  );
  const snoozeTask = useCallback(
    (id: string, minutes = 20) =>
      dispatch({ type: "TASK_SNOOZE", taskId: id, minutes }),
    [dispatch],
  );
  const openTaskDetail = useCallback(
    (id: string) => dispatch({ type: "OPEN_DETAIL", taskId: id }),
    [dispatch],
  );
  const closeTaskDetail = useCallback(
    () => dispatch({ type: "CLOSE_DETAIL" }),
    [dispatch],
  );
  const dismissPlanBanner = useCallback(
    () => dispatch({ type: "DISMISS_BANNER" }),
    [dispatch],
  );
  const simulateRecoveryBand = useCallback(
    (band: RecoverySimulationBand) =>
      dispatch({ type: "SIMULATE_RECOVERY", band }),
    [dispatch],
  );

  const startNextBest = useCallback(() => {
    const id = state.nextBest.linkedTaskId;
    if (!id) return;
    const linked = state.tasks.find((t) => t.id === id);
    setState((s) => {
      let next = applyLiveEvent(s, { type: "OPEN_DETAIL", taskId: id });
      if (linked?.status === "planned") {
        next = applyLiveEvent(next, {
          type: "APPEND_WHAT_CHANGED",
          entry: {
            headline: `Opened “${linked.title}”.`,
            reason: "Details viewed from next best action.",
            source: "task",
          },
        });
      }
      return next;
    });
  }, [state.nextBest.linkedTaskId, state.tasks]);

  const remindNextBest = useCallback(() => {
    const id = state.nextBest.linkedTaskId;
    if (!id) return;
    dispatch({ type: "TASK_SNOOZE", taskId: id, minutes: 15 });
  }, [dispatch, state.nextBest.linkedTaskId]);

  return useMemo(
    () => ({
      ...state,
      completeTask,
      skipTask,
      markTaskMissed,
      snoozeTask,
      openTaskDetail,
      closeTaskDetail,
      dismissPlanBanner,
      startNextBest,
      remindNextBest,
      simulateRecoveryBand,
    }),
    [
      state,
      completeTask,
      skipTask,
      markTaskMissed,
      snoozeTask,
      openTaskDetail,
      closeTaskDetail,
      dismissPlanBanner,
      startNextBest,
      remindNextBest,
      simulateRecoveryBand,
    ],
  );
}
