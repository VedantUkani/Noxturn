"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setStoredPlanMode } from "@/lib/session";
import type { TodayDashboardPayload } from "@/lib/dashboard-types";
import type { RecoverySimulationBand } from "@/lib/dashboard-types";
import {
  applyLiveEvent,
  initialLiveState,
  type LiveDashboardState,
} from "@/lib/dashboard-live";
import type { EvidenceLensFocus } from "@/lib/evidence-lens";
import { NOXTURN_EVIDENCE_LENS_EVENT } from "@/lib/evidence-lens-events";

export type TodayDashboardActions = {
  completeTask: (id: string) => void;
  skipTask: (id: string) => void;
  markTaskMissed: (id: string) => void;
  snoozeTask: (id: string, minutes?: number) => void;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;
  dismissPlanBanner: () => void;
  setPlanMode: (mode: string) => void;
  startNextBest: () => void;
  remindNextBest: () => void;
  exhaustionCheckIn: () => void;
  simulatePoorWearableImport: () => void;
  simulateRecoveryBand: (band: RecoverySimulationBand) => void;
  resetDemo: () => void;
  openEvidenceLens: (focus: EvidenceLensFocus) => void;
  closeEvidenceLens: () => void;
};

export type TodayDashboardState = LiveDashboardState &
  TodayDashboardActions & {
    evidenceLensOpen: boolean;
    evidenceLensFocus: EvidenceLensFocus;
  };

export function useTodayDashboard(
  initial: TodayDashboardPayload,
): TodayDashboardState {
  const baselineRef = useRef(initial);
  baselineRef.current = initial;

  const [state, setState] = useState(() => initialLiveState(initial));
  const [evidenceLensOpen, setEvidenceLensOpen] = useState(false);
  const [evidenceLensFocus, setEvidenceLensFocus] = useState<EvidenceLensFocus>(
    { kind: "overview" },
  );

  useEffect(() => {
    setStoredPlanMode(state.planMode);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("noxturn-plan-mode"));
    }
  }, [state.planMode]);

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

  useEffect(() => {
    const onLens = () => {
      setEvidenceLensFocus({ kind: "overview" });
      setEvidenceLensOpen(true);
    };
    window.addEventListener(NOXTURN_EVIDENCE_LENS_EVENT, onLens);
    return () => window.removeEventListener(NOXTURN_EVIDENCE_LENS_EVENT, onLens);
  }, []);

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
  const setPlanMode = useCallback(
    (mode: string) => dispatch({ type: "SET_PLAN_MODE", mode }),
    [dispatch],
  );
  const exhaustionCheckIn = useCallback(
    () => dispatch({ type: "EXHAUSTION_CHECKIN" }),
    [dispatch],
  );
  const simulatePoorWearableImport = useCallback(
    () => dispatch({ type: "POOR_WEARABLE_IMPORT" }),
    [dispatch],
  );
  const simulateRecoveryBand = useCallback(
    (band: RecoverySimulationBand) =>
      dispatch({ type: "SIMULATE_RECOVERY", band }),
    [dispatch],
  );

  const resetDemo = useCallback(() => {
    setEvidenceLensOpen(false);
    setEvidenceLensFocus({ kind: "overview" });
    setState(initialLiveState(baselineRef.current));
  }, []);

  const openEvidenceLens = useCallback((focus: EvidenceLensFocus) => {
    setEvidenceLensFocus(focus);
    setEvidenceLensOpen(true);
  }, []);

  const closeEvidenceLens = useCallback(() => {
    setEvidenceLensOpen(false);
  }, []);

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
      evidenceLensOpen,
      evidenceLensFocus,
      completeTask,
      skipTask,
      markTaskMissed,
      snoozeTask,
      openTaskDetail,
      closeTaskDetail,
      dismissPlanBanner,
      setPlanMode,
      startNextBest,
      remindNextBest,
      exhaustionCheckIn,
      simulatePoorWearableImport,
      simulateRecoveryBand,
      resetDemo,
      openEvidenceLens,
      closeEvidenceLens,
    }),
    [
      state,
      evidenceLensOpen,
      evidenceLensFocus,
      completeTask,
      skipTask,
      markTaskMissed,
      snoozeTask,
      openTaskDetail,
      closeTaskDetail,
      dismissPlanBanner,
      setPlanMode,
      startNextBest,
      remindNextBest,
      exhaustionCheckIn,
      simulatePoorWearableImport,
      simulateRecoveryBand,
      resetDemo,
      openEvidenceLens,
      closeEvidenceLens,
    ],
  );
}
