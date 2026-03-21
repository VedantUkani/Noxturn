import { cn } from "@/lib/utils";

/** Page-level vertical rhythm between Today sections. */
export const todaySectionStack = "space-y-7 md:space-y-9";

/** Primary elevated panel — shared by hero, live sync, recommendations, avoidance section shell. */
export const todayCardShell = cn(
  "rounded-2xl border border-slate-700/40",
  "shadow-[0_24px_64px_-32px_rgba(0,0,0,0.88),inset_0_1px_0_0_rgba(255,255,255,0.065)]",
);

/** Dark inset strip (notes, HRV explanation, etc.). */
export const todayInsetStrip = cn(
  "rounded-xl border border-slate-800/85 bg-slate-950/80",
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
