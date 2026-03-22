import type { Severity } from "@/lib/types";
import type { WeekRiskLabel } from "@/lib/week-risk-view-model";

export const WEEK_RISK_TITLES: Record<WeekRiskLabel, string> = {
  rapid_flip: "Rapid circadian flip",
  short_turnaround: "Short turnaround",
  low_recovery: "Low recovery window",
  unsafe_drive: "Unsafe fatigue — commute",
  repeated_nights_no_reset: "Repeated nights — thin reset",
  missed_anchor_sleep: "Missed anchor sleep block",
  wearable_recovery_deficit: "Wearable recovery deficit",
  isolation_low_opportunity: "Isolation — low recovery opportunity",
};

/** Severity → subtle accent (avoid painting the whole UI red). */
export function severityAccent(sev: Severity): string {
  switch (sev) {
    case "low":
      return "bg-slate-500/25 border-slate-500/35 text-slate-200";
    case "moderate":
      return "bg-amber-500/15 border-amber-400/35 text-amber-100/95";
    case "high":
      return "bg-orange-500/18 border-orange-400/40 text-orange-100/95";
    case "critical":
      return "bg-rose-600/22 border-rose-500/45 text-rose-50/95";
    default:
      return "bg-slate-600/20 border-slate-500/30 text-slate-200";
  }
}

export function severityDotClass(sev: Severity): string {
  switch (sev) {
    case "low":
      return "bg-slate-400";
    case "moderate":
      return "bg-amber-400";
    case "high":
      return "bg-orange-400";
    case "critical":
      return "bg-rose-400";
    default:
      return "bg-slate-400";
  }
}

export function blockTypeClasses(
  blockType: string,
  kind: "shift" | "obligation",
): string {
  if (kind === "obligation") {
    return "border border-violet-500/35 bg-violet-950/50 text-violet-100/90";
  }
  switch (blockType) {
    case "night_shift":
      return "border border-indigo-400/30 bg-indigo-950/55 text-indigo-100/95";
    case "evening_shift":
      return "border border-violet-400/25 bg-violet-950/45 text-violet-100/90";
    case "day_shift":
      return "border border-[#45e0d4]/25 bg-[#0c2a3d]/80 text-[#edf2ff]/95";
    case "transition_day":
      return "border border-cyan-400/25 bg-cyan-950/35 text-cyan-50/90";
    case "off_day":
      return "border border-slate-600/30 bg-slate-900/40 text-slate-300";
    default:
      return "border border-slate-600/35 bg-slate-900/45 text-slate-200";
  }
}

export function strainScoreHue(score: number): string {
  if (score < 35) return "text-[#45e0d4]";
  if (score < 60) return "text-amber-200";
  if (score < 80) return "text-orange-300";
  return "text-rose-300";
}
