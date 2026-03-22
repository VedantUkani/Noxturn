"use client";

import { useCallback, useEffect, useReducer } from "react";
import {
  clearWizardState,
  loadWizardState,
  saveWizardState,
  type PersistedWizardState,
} from "./onboarding-persist";
import {
  defaultOnboardingDraft,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from "./types";

type WizardState = PersistedWizardState;

type Action =
  | { type: "hydrate"; payload: WizardState }
  | { type: "setStep"; step: OnboardingStepIndex }
  | { type: "patchDraft"; patch: Partial<OnboardingDraft> }
  | { type: "reset" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "setStep":
      return { ...state, step: action.step };
    case "patchDraft":
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "reset":
      return { step: 1, draft: defaultOnboardingDraft() };
    default:
      return state;
  }
}

const initial: WizardState = { step: 1, draft: defaultOnboardingDraft() };

export function validateStep(
  step: OnboardingStepIndex,
  draft: OnboardingDraft,
): boolean {
  switch (step) {
    case 1:
      return (
        draft.roleId !== null &&
        draft.fullName.trim().length > 0
      );
    case 2:
      return (
        Number.isFinite(draft.commuteMinutes) &&
        draft.commuteMinutes >= 0 &&
        draft.commuteMinutes <= 120
      );
    case 3:
    case 4:
    case 5:
      return true;
    default:
      return false;
  }
}

/** Last step — always finishable (wearables + health report are optional). */
export function canFinish(_draft: OnboardingDraft): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
  return true;
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
      step: Math.min(5, state.step + 1) as OnboardingStepIndex,
    });
  }, [state.step]);

  const goBack = useCallback(() => {
    dispatch({
      type: "setStep",
      step: Math.max(1, state.step - 1) as OnboardingStepIndex,
    });
  }, [state.step]);

  const resetWizard = useCallback(() => {
    clearWizardState();
    dispatch({ type: "reset" });
  }, []);

  return { step: state.step, draft: state.draft, patchDraft, goNext, goBack, resetWizard };
}
