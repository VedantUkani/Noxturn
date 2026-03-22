import type { RecoveryAnalyticsResponse } from "@/lib/types";
import type { RecoveryAnalyticsViewModel } from "./types";

const MOOD_HEADLINE: Record<string, { lead: string; trail: string }> = {
  steady: {
    lead: "Your rhythm is holding strong. You protected ",
    trail: " anchor blocks this week.",
  },
  rebuilding: {
    lead: "Your rhythm is rebuilding. You protected ",
    trail: " primary sleep blocks this week.",
  },
  interrupted: {
    lead: "Recovery is disrupted. You completed ",
    trail: " anchor tasks this week — every one helped.",
  },
};

const MOOD_HEADER: Record<string, { titleAccent: string }> = {
  steady: { titleAccent: "Holding Steady" },
  rebuilding: { titleAccent: "Building Resilience" },
  interrupted: { titleAccent: "Recovery in Progress" },
};

export function mapRecoveryApiToViewModel(
  d: RecoveryAnalyticsResponse,
): RecoveryAnalyticsViewModel {
  const mood = d.headline_mood ?? "rebuilding";
  const hl = MOOD_HEADLINE[mood] ?? MOOD_HEADLINE.rebuilding;
  const hdr = MOOD_HEADER[mood] ?? MOOD_HEADER.rebuilding;

  const pills: string[] = [];
  if (d.trend_stable) pills.push("STABLE");
  pills.push(`VOLATILITY: ${d.trend_volatility}`);

  return {
    header: {
      titleWhite: "Recovery Rhythm:",
      titleAccent: hdr.titleAccent,
    },
    snapshot: {
      headlineLead: hl.lead,
      protectedCount: d.protected_count,
      protectedTotal: d.protected_total,
      headlineTrail: hl.trail,
      microLabel: d.snapshot_label,
    },
    protectedBlocks: {
      title: "Protected Blocks",
      subtitle: "Anchor task completion — this week",
      weekdayLabels: d.daily_blocks.map((b) => b.day),
      daily: d.daily_blocks,
    },
    metrics: [
      {
        id: "light-consistency",
        label: "Light Timing Adherence",
        percent: d.light_consistency_pct,
        accent: "lightBlue",
      },
      {
        id: "caffeine-cutoff",
        label: "Caffeine Cutoff Adherence",
        percent: d.caffeine_cutoff_pct,
        accent: "yellow",
      },
    ],
    resilienceTrends: {
      title: "Resilience Trends",
      subtitle: "Biological stability over 4 weeks",
      pills,
      points: d.trend_points.map((p) => ({
        weekLabel: p.week_label,
        value: p.value,
      })),
    },
    supportiveNote: {
      title: "Supportive Note",
      quote: d.supportive_quote,
      footerLabel: "RESILIENCE INSIGHT",
    },
    bottomInsight: {
      text: d.bottom_insight,
      ctaLabel: "Review Protocol",
    },
  };
}
