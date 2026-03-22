const ONBOARDING_DONE_KEY = "noxturn_onboarding_done";
/** After login, where to send the user if they skip onboarding (from `?from=` or `/today`). */
export const POST_ONBOARDING_DEST_KEY = "noxturn_post_onboarding";

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_DONE_KEY) === "1";
}

export function markOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_DONE_KEY, "1");
}
