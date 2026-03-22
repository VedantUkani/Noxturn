export const ONBOARDING_STEP_LABELS = [
  "Role",
  "Commute",
  "Preferences",
  "Schedule",
] as const;

export type OnboardingStepIndex = 1 | 2 | 3 | 4;

/** Matches legacy static onboarding IDs. */
export type RoleId =
  | "nurse"
  | "paramedic"
  | "factory_worker"
  | "resident"
  | "other";

export type SleepConstraint =
  | "cant_sleep_before_9am"
  | "light_sensitive"
  | "short_sleep_risk"
  | "none";

export type ScheduleMode = "paste" | "manual";

/** Legacy manual row: typed shift + optional title + times. */
export type ManualShiftDraft = {
  id: string;
  type: "day_shift" | "night_shift" | "evening_shift" | "day_off";
  title: string;
  date: string;
  start: string;
  end: string;
};

/** Set after Parse & import or Import shifts (mock success until API exists). */
export type ScheduleImportResult = {
  count: number;
  warnings: string[];
};

/** Client-side draft — wire to POST /api/onboarding/profile later. */
export type OnboardingDraft = {
  roleId: RoleId | null;
  commuteMinutes: number;
  sleepConstraint: SleepConstraint;
  buddyCheckins: boolean;
  scheduleMode: ScheduleMode;
  /** Paste panel: raw CSV / shift lines. */
  scheduleNotes: string;
  scheduleDeferred: boolean;
  manualShifts: ManualShiftDraft[];
  /** Filled when user successfully runs parse or manual import (legacy behavior). */
  importComplete: ScheduleImportResult | null;
};

export const defaultOnboardingDraft = (): OnboardingDraft => ({
  roleId: null,
  commuteMinutes: 35,
  sleepConstraint: "cant_sleep_before_9am",
  buddyCheckins: true,
  scheduleMode: "paste",
  scheduleNotes: "",
  scheduleDeferred: false,
  manualShifts: [],
  importComplete: null,
});
