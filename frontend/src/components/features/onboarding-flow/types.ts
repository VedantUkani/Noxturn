import type {
  CaffeineHabit,
  ChronotypePreference,
  TransportMode,
} from "@/lib/user-profile-settings";

export const ONBOARDING_STEP_LABELS = [
  "Identity",
  "Commute",
  "Sleep",
  "Wearables",
  "Health",
] as const;

export type OnboardingStepIndex = 1 | 2 | 3 | 4 | 5;

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

/** Client-side draft accumulated across the 5 onboarding steps. */
export type OnboardingDraft = {
  // Step 1 — Identity
  fullName: string;
  email: string;
  roleId: RoleId | null;
  roleSpecialty: string;

  // Step 2 — Work context
  commuteMinutes: number;
  transportMode: TransportMode;

  // Step 3 — Sleep preferences
  chronotype: ChronotypePreference;
  preferredSleepHours: number;
  anchorSleepStart: string;
  anchorSleepEnd: string;
  anchorNote: string;
  sleepConstraint: SleepConstraint;
  caffeineHabit: CaffeineHabit;

  // Step 4 — Wearables
  ouraConnected: boolean;
  wearablesSkipped: boolean;

  // Step 5 — Health report
  healthReportPath: string | null;
  healthReportFileName: string | null;
  healthReportSkipped: boolean;
};

export const defaultOnboardingDraft = (): OnboardingDraft => ({
  fullName: "",
  email: "",
  roleId: null,
  roleSpecialty: "",
  commuteMinutes: 35,
  transportMode: "car",
  chronotype: "neutral",
  preferredSleepHours: 7.5,
  anchorSleepStart: "02:00",
  anchorSleepEnd: "06:00",
  anchorNote: "",
  sleepConstraint: "cant_sleep_before_9am",
  caffeineHabit: "before_noon",
  ouraConnected: false,
  wearablesSkipped: false,
  healthReportPath: null,
  healthReportFileName: null,
  healthReportSkipped: false,
});
