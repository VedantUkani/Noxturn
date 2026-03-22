import {
  defaultOnboardingDraft,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from "./types";

const STORAGE_KEY = "noxturn_onboarding_wizard_v2";

export type PersistedWizardState = {
  step: OnboardingStepIndex;
  draft: OnboardingDraft;
};

function normalizeDraft(raw: Partial<OnboardingDraft>): OnboardingDraft {
  const base = defaultOnboardingDraft();
  // Strip any legacy fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { buddyCheckins, scheduleMode, scheduleNotes, scheduleDeferred, manualShifts, importComplete, ...rest } =
    raw as Partial<OnboardingDraft> & {
      buddyCheckins?: boolean;
      scheduleMode?: string;
      scheduleNotes?: string;
      scheduleDeferred?: boolean;
      manualShifts?: unknown[];
      importComplete?: unknown;
    };
  return { ...base, ...rest };
}

export function loadWizardState(): PersistedWizardState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    const step = Number(o.step);
    if (step !== 1 && step !== 2 && step !== 3 && step !== 4 && step !== 5)
      return null;
    const draft = o.draft as Partial<OnboardingDraft> | undefined;
    if (!draft || typeof draft !== "object") return null;
    return { step: step as OnboardingStepIndex, draft: normalizeDraft(draft) };
  } catch {
    return null;
  }
}

export function saveWizardState(state: PersistedWizardState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function clearWizardState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
