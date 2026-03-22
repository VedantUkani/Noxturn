import type { RoleId, SleepConstraint } from "@/components/features/onboarding-flow/types";
import type { SettingsPageViewModel } from "@/components/features/settings-page/types";
import { notifyIdentityChanged } from "./session-identity";

export const USER_PROFILE_SETTINGS_STORAGE_KEY =
  "noxturn_user_profile_settings_v1";
const STORAGE_KEY = USER_PROFILE_SETTINGS_STORAGE_KEY;

export type TransportMode = "car" | "transit" | "walk_cycle" | "other";

export type ChronotypePreference = "early_bird" | "neutral" | "night_owl";

export type CaffeineHabit =
  | "before_noon"
  | "afternoon_ok"
  | "late_sensitive"
  | "minimal";

/** Persisted profile — swap for API DTO when backend exists. */
export type UserProfileSettings = {
  fullName: string;
  email: string;
  roleId: RoleId;
  /** Department, PGY level, unit, etc. */
  roleSpecialty: string;
  commuteMinutes: number;
  transportMode: TransportMode;
  chronotype: ChronotypePreference;
  preferredSleepHours: number;
  /** 24h "HH:MM" for `<input type="time" />` */
  anchorSleepStart: string;
  anchorSleepEnd: string;
  anchorNote: string;
  sleepConstraint: SleepConstraint;
  caffeineHabit: CaffeineHabit;
  /** Wearable connection state */
  fitbitConnected: boolean;
  /** Health context from onboarding questionnaire */
  onMedications: boolean | null;
  medicationDetails: string;
  sleepConditions: string[];
  medicalHistory: string[];
};

const ROLE_TITLE: Record<RoleId, string> = {
  nurse: "Nurse / RN",
  paramedic: "Paramedic / EMT",
  factory_worker: "Factory / Shift Worker",
  resident: "Medical Resident",
  other: "Other",
};

/** Subtitle line for sidebar / compact profile (specialty preferred over generic role title). */
export function profileCardRoleLine(p: UserProfileSettings): string {
  const sp = p.roleSpecialty.trim();
  if (sp && sp !== "—") return sp;
  return ROLE_TITLE[p.roleId];
}

function inferRoleIdFromProfile(profile: SettingsPageViewModel["profile"]): RoleId {
  const t = `${profile.roleBadge} ${profile.roleSpecialty}`.toLowerCase();
  if (t.includes("nurse") || t.includes("rn")) return "nurse";
  if (t.includes("paramedic") || t.includes("emt")) return "paramedic";
  if (t.includes("factory") || t.includes("shift worker")) return "factory_worker";
  if (t.includes("resident") || t.includes("pgy")) return "resident";
  return "other";
}

function inferChronotypeFromSleep(
  sleep: SettingsPageViewModel["sleep"],
): ChronotypePreference {
  const t = sleep.chronotype.title.toLowerCase();
  if (t.includes("early") || t.includes("lark")) return "early_bird";
  if (t.includes("night") || t.includes("owl")) return "night_owl";
  return "neutral";
}

function parseHoursLabel(label: string): number {
  const m = label.match(/(\d+(\.\d+)?)/);
  if (!m) return 7.5;
  const n = Number.parseFloat(m[1]);
  return Number.isFinite(n) ? n : 7.5;
}

/** Parse strings like "02:00 AM" to 24h HH:MM; fallback mock anchor. */
function parseTwelveHourToHHMM(s: string): string | null {
  const t = s.trim().toUpperCase();
  const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;
  let h = Number.parseInt(match[1], 10);
  const min = match[2];
  const ap = match[3];
  if (ap === "AM") {
    if (h === 12) h = 0;
  } else if (h !== 12) {
    h += 12;
  }
  return `${String(h).padStart(2, "0")}:${min}`;
}

export function formatHHMMForDisplay(hhmm: string): string {
  const [hs, ms] = hhmm.split(":");
  const h = Number.parseInt(hs ?? "0", 10);
  const m = Number.parseInt(ms ?? "0", 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sleepHoursToSliderRatio(hours: number): number {
  const clamped = Math.min(12, Math.max(5, hours));
  return (clamped - 5) / 7;
}

function chronotypeVM(
  pref: ChronotypePreference,
): SettingsPageViewModel["sleep"]["chronotype"] {
  const map: Record<
    ChronotypePreference,
    { title: string; description: string }
  > = {
    early_bird: {
      title: "Early bird",
      description:
        "You recover best with earlier sleep onset. We bias wind-down and light cues earlier in the evening.",
    },
    neutral: {
      title: "Balanced",
      description:
        "Flexible timing across rotations. Recovery windows adapt to your latest stable sleep pattern.",
    },
    night_owl: {
      title: "Night owl",
      description:
        "Optimized for late shifts. Cognitive peak is biased to late afternoon and evening when possible.",
    },
  };
  const row = map[pref];
  return {
    columnLabel: "Chronotype Alignment",
    title: row.title,
    description: row.description,
  };
}

/**
 * Default persisted profile inferred from the static mock — used before any save,
 * and as schema fallback when storage is partial.
 */
export function userProfileDefaultsFromViewModel(
  vm: SettingsPageViewModel,
): UserProfileSettings {
  const start =
    parseTwelveHourToHHMM(vm.sleep.anchor.startTime) ?? "02:00";
  const end =
    parseTwelveHourToHHMM(vm.sleep.anchor.endTime) ?? "06:00";

  return {
    fullName: vm.profile.fullName,
    email: vm.profile.email,
    roleId: inferRoleIdFromProfile(vm.profile),
    roleSpecialty: vm.profile.roleSpecialty,
    commuteMinutes: vm.profile.commuteMinutes,
    transportMode: "car",
    chronotype: inferChronotypeFromSleep(vm.sleep),
    preferredSleepHours: parseHoursLabel(vm.sleep.duration.hoursLabel),
    anchorSleepStart: start,
    anchorSleepEnd: end,
    anchorNote: vm.sleep.anchor.note,
    sleepConstraint: "cant_sleep_before_9am",
    caffeineHabit: "afternoon_ok",
    fitbitConnected: false,
    onMedications: null,
    medicationDetails: "",
    sleepConditions: [],
    medicalHistory: [],
  };
}

export function loadUserProfileSettings(
  baseVm: SettingsPageViewModel,
): UserProfileSettings | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const partial = JSON.parse(raw) as Partial<UserProfileSettings>;
    if (!partial || typeof partial !== "object") return null;
    return normalizeUserProfileSettings(partial, baseVm);
  } catch {
    return null;
  }
}

export function saveUserProfileSettings(profile: UserProfileSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  notifyIdentityChanged();
}

/**
 * Returns the stored profile in the shape the backend's UserProfile schema expects.
 * Safe to call client-side only. Returns null if no profile has been saved yet.
 */
export function getUserProfileForApi(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<UserProfileSettings>;
    if (!p || typeof p !== "object") return null;
    return {
      role_id:               p.roleId ?? null,
      role_specialty:        p.roleSpecialty ?? null,
      chronotype:            p.chronotype ?? null,
      preferred_sleep_hours: p.preferredSleepHours ?? null,
      anchor_sleep_start:    p.anchorSleepStart ?? null,
      anchor_sleep_end:      p.anchorSleepEnd ?? null,
      sleep_constraint:      p.sleepConstraint ?? null,
      caffeine_habit:        p.caffeineHabit ?? null,
      transport_mode:        p.transportMode ?? null,
      fitbit_connected:      p.fitbitConnected ?? null,
      on_medications:        p.onMedications ?? null,
      medication_details:    p.medicationDetails ?? null,
      sleep_conditions:      p.sleepConditions ?? null,
      medical_history:       p.medicalHistory ?? null,
    };
  } catch {
    return null;
  }
}

/** Merge defaults so older stored blobs stay valid. */
export function normalizeUserProfileSettings(
  partial: Partial<UserProfileSettings> | null | undefined,
  baseVm: SettingsPageViewModel,
): UserProfileSettings {
  const base = userProfileDefaultsFromViewModel(baseVm);
  if (!partial) return base;
  // Strip legacy fields that no longer exist in UserProfileSettings
  const stripped = { ...partial } as Record<string, unknown>;
  delete stripped.buddyCheckinsEnabled;
  delete stripped.trustedContactName;
  delete stripped.trustedContactDetail;
  const rest = stripped as Partial<UserProfileSettings>;
  return { ...base, ...rest };
}

export function applyUserProfileToViewModel(
  base: SettingsPageViewModel,
  profile: UserProfileSettings,
): SettingsPageViewModel {
  const p = normalizeUserProfileSettings(profile, base);
  const hoursLabel =
    p.preferredSleepHours % 1 === 0
      ? `${Math.round(p.preferredSleepHours)} Hours`
      : `${p.preferredSleepHours} Hours`;

  const anchorNote =
    p.anchorNote.trim() || base.sleep.anchor.note;

  return {
    ...base,
    profile: {
      ...base.profile,
      fullName: p.fullName.trim(),
      email: p.email.trim(),
      commuteMinutes: p.commuteMinutes,
      clinicalRoleLabel: base.profile.clinicalRoleLabel,
      roleBadge: ROLE_TITLE[p.roleId],
      roleSpecialty: p.roleSpecialty.trim() || "—",
    },
    sleep: {
      ...base.sleep,
      chronotype: chronotypeVM(p.chronotype),
      duration: {
        ...base.sleep.duration,
        hoursLabel,
        sliderFillRatio: sleepHoursToSliderRatio(p.preferredSleepHours),
      },
      anchor: {
        ...base.sleep.anchor,
        startTime: formatHHMMForDisplay(p.anchorSleepStart),
        endTime: formatHHMMForDisplay(p.anchorSleepEnd),
        note: anchorNote,
      },
    },
  };
}

export async function persistUserProfileSettings(
  profile: UserProfileSettings,
): Promise<void> {
  await new Promise((r) => window.setTimeout(r, 320));
  saveUserProfileSettings(profile);
}
