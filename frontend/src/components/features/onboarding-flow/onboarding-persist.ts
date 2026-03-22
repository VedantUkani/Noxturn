import {
  defaultOnboardingDraft,
  type OnboardingDraft,
  type OnboardingStepIndex,
} from "./types";

const STORAGE_KEY = "noxturn_onboarding_wizard_v1";

export type PersistedWizardState = {
  step: OnboardingStepIndex;
  draft: OnboardingDraft;
};

function normalizeDraft(raw: Partial<OnboardingDraft>): OnboardingDraft {
  const base = defaultOnboardingDraft();
  const { buddyCheckins: _legacyBuddy, ...rawRest } = raw as Partial<OnboardingDraft> & {
    buddyCheckins?: boolean;
  };
  return {
    ...base,
    ...rawRest,
    manualShifts: Array.isArray(raw.manualShifts)
      ? raw.manualShifts.map((s) => ({
          id: String(s.id),
          type: s.type ?? "day_shift",
          title: typeof s.title === "string" ? s.title : "",
          date: typeof s.date === "string" ? s.date : "",
          start: typeof s.start === "string" ? s.start : "",
          end: typeof s.end === "string" ? s.end : "",
        }))
      : base.manualShifts,
    importComplete:
      raw.importComplete &&
      typeof raw.importComplete === "object" &&
      typeof raw.importComplete.count === "number"
        ? {
            count: raw.importComplete.count,
            warnings: Array.isArray(raw.importComplete.warnings)
              ? raw.importComplete.warnings
              : [],
          }
        : null,
  };
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
    if (step !== 1 && step !== 2 && step !== 3 && step !== 4) return null;
    const draft = o.draft as Partial<OnboardingDraft> | undefined;
    if (!draft || typeof draft !== "object") return null;
    return {
      step: step as OnboardingStepIndex,
      draft: normalizeDraft(draft),
    };
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
