import type { RoleId } from "@/components/features/onboarding-flow/types";
import type { UserProfileSettings } from "@/lib/user-profile-settings";

const ROLE_IDS: RoleId[] = [
  "nurse",
  "paramedic",
  "factory_worker",
  "resident",
  "other",
];

export type EditProfileFieldErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "roleId"
    | "commuteMinutes"
    | "preferredSleepHours"
    | "anchorSleepStart"
    | "anchorSleepEnd"
    | "form",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validHHMM(s: string): boolean {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  return Boolean(m);
}

export function validateUserProfileSettings(
  values: UserProfileSettings,
): EditProfileFieldErrors {
  const errors: EditProfileFieldErrors = {};
  if (!values.fullName.trim()) {
    errors.fullName = "Enter your full name.";
  }
  if (!ROLE_IDS.includes(values.roleId)) {
    errors.roleId = "Select your role.";
  }
  if (
    !Number.isFinite(values.commuteMinutes) ||
    values.commuteMinutes < 0 ||
    values.commuteMinutes > 120
  ) {
    errors.commuteMinutes = "Use 0–120 minutes.";
  }
  if (
    !Number.isFinite(values.preferredSleepHours) ||
    values.preferredSleepHours < 5 ||
    values.preferredSleepHours > 12
  ) {
    errors.preferredSleepHours = "Target sleep is usually between 5 and 12 hours.";
  }
  if (!validHHMM(values.anchorSleepStart)) {
    errors.anchorSleepStart = "Choose a valid start time.";
  }
  if (!validHHMM(values.anchorSleepEnd)) {
    errors.anchorSleepEnd = "Choose a valid end time.";
  }
  const em = values.email.trim();
  if (em && !EMAIL_RE.test(em)) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}
