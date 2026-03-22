import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

/** Page-level vertical rhythm between Today sections. */
export const todaySectionStack = "space-y-7 md:space-y-9";

/** Primary elevated panel — Recovery-aligned surfaces. */
export const todayCardShell = cn(
  "rounded-[22px] border border-white/[0.06] bg-[#141f42]",
  "shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
);

/** Dark inset strip (notes, HRV explanation, etc.). */
export const todayInsetStrip = cn(
  "rounded-xl border border-white/[0.08] bg-[#07142f]/95",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.045)]",
);

/** Standard icon size inside 40×40-ish chips across Today cards. */
export const todayChipIconClass = "h-[18px] w-[18px]";

/** Hero + live sync column split on large screens. */
export const todayHeroRowClass =
  "grid gap-5 lg:grid-cols-[1fr_280px] lg:items-stretch lg:gap-5";

/** Recommendation cards: single column until `lg`, then three-up. */
export const todayRecommendationGridClass = "grid grid-cols-1 gap-5 lg:grid-cols-3";

/** Avoidance cards inside the framed section. */
export const todayAvoidanceGridClass = "grid grid-cols-1 gap-5 lg:grid-cols-2";

/** Re-export for consumers that need focus rings on Today controls */
export const todayFocusRing = nx.focusRing;
