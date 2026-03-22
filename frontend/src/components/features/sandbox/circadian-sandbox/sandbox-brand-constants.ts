/**
 * Sandbox scenario accents — base palette from `@/lib/ui-theme`.
 */
import { NOXTURN_COLORS } from "@/lib/ui-theme";

/** Scenario-specific accents (strain/coral CTA) layered on the shared theme */
export const SANDBOX_COLORS = {
  ...NOXTURN_COLORS,
  coral: "#f3aaa4",
  coralButton: "#6a2736",
} as const;
