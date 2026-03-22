/**
 * Recovery analytics screen — brand strings stay here; colors come from the shared theme.
 */
import { NOXTURN_COLORS } from "@/lib/ui-theme";

export const RECOVERY_ANALYTICS_BRAND = {
  displayName: "CircadianGuardian",
  tagline: "Recovery Copilot",
} as const;

/** @deprecated Prefer `NOXTURN_COLORS` from `@/lib/ui-theme` — kept for existing imports. */
export const recoveryAnalyticsColors = NOXTURN_COLORS;
