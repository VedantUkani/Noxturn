"use client";

import { useCallback, useEffect, useReducer } from "react";
import { getStoredScheduleBlocks } from "@/lib/session";
import {
  clearWizardState,
  loadWizardState,
  saveWizardState,
  type PersistedWizardState,
} from "./onboarding-persist";
import {
  defaultOnboardingDraft,
  type ManualShiftDraft,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from "./types";

type WizardState = PersistedWizardState;

type Action =
  | { type: "hydrate"; payload: WizardState }
  | { type: "setStep"; step: OnboardingStepIndex }
  | { type: "patchDraft"; patch: Partial<OnboardingDraft> }
  | { type: "addShift"; shift: ManualShiftDraft }
  | { type: "removeShift"; id: string }
  | { type: "reset" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "setStep":
      return { ...state, step: action.step };
    case "patchDraft":
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "addShift":
      return {
        ...state,
        draft: {
          ...state.draft,
          manualShifts: [...state.draft.manualShifts, action.shift],
        },
      };
    case "removeShift":
      return {
        ...state,
        draft: {
          ...state.draft,
          manualShifts: state.draft.manualShifts.filter(
            (s) => s.id !== action.id,
          ),
        },
      };
    case "reset":
      return { step: 1, draft: defaultOnboardingDraft() };
    default:
      return state;
  }
}

const initial: WizardState = {
  step: 1,
  draft: defaultOnboardingDraft(),
};

export function validateStep(
  step: OnboardingStepIndex,
  draft: OnboardingDraft,
): boolean {
  switch (step) {
    case 1:
      return draft.roleId !== null;
    case 2:
      return (
        Number.isFinite(draft.commuteMinutes) &&
        draft.commuteMinutes >= 0 &&
        draft.commuteMinutes <= 120
      );
    case 3:
      return true;
    case 4:
      return true;
    default:
      return false;
  }
}

/** Finish when user defers, has blocks in the shared schedule store (same as /schedule), or legacy import flag. */
export function canFinishSchedule(draft: OnboardingDraft): boolean {
  if (draft.scheduleDeferred) return true;
  if (typeof window !== "undefined" && getStoredScheduleBlocks().length > 0) {
    return true;
  }
  if (draft.importComplete !== null) return true;
  return false;
}

export function useOnboardingWizard() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    const loaded = loadWizardState();
    if (loaded) dispatch({ type: "hydrate", payload: loaded });
  }, []);

  useEffect(() => {
    saveWizardState(state);
  }, [state]);

  const patchDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    dispatch({ type: "patchDraft", patch });
  }, []);

  const goNext = useCallback(() => {
    dispatch({
      type: "setStep",
      step: Math.min(4, state.step + 1) as OnboardingStepIndex,
    });
  }, [state.step]);

  const goBack = useCallback(() => {
    dispatch({
      type: "setStep",
      step: Math.max(1, state.step - 1) as OnboardingStepIndex,
    });
  }, [state.step]);

  const addShift = useCallback((shift: ManualShiftDraft) => {
    dispatch({ type: "addShift", shift });
  }, []);

  const removeShift = useCallback((id: string) => {
    dispatch({ type: "removeShift", id });
  }, []);

  const resetWizard = useCallback(() => {
    clearWizardState();
    dispatch({ type: "reset" });
  }, []);

  return {
    step: state.step,
    draft: state.draft,
    patchDraft,
    goNext,
    goBack,
    addShift,
    removeShift,
    resetWizard,
  };
}
