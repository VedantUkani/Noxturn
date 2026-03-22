import type { RecoveryAnalyticsViewModel } from "./types";

/** Mock payload — replace with API mapping when backend is ready. */
export const mockRecoveryAnalyticsViewModel: RecoveryAnalyticsViewModel = {
  header: {
    titleWhite: "Recovery Rhythm:",
    titleAccent: "Building Resilience",
  },
  snapshot: {
    headlineLead: "Your rhythm is rebuilding. You protected ",
    protectedCount: 14,
    protectedTotal: 18,
    headlineTrail: " primary sleep blocks this week.",
    microLabel: "WEEKLY STABILITY SNAPSHOT",
  },
  protectedBlocks: {
    title: "Protected Blocks",
    subtitle: "Consistency of dedicated rest windows",
    weekdayLabels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  },
  metrics: [
    {
      id: "light-consistency",
      label: "Light Consistency",
      percent: 78,
      accent: "lightBlue",
    },
    {
      id: "caffeine-cutoff",
      label: "Caffeine Cutoff",
      percent: 85,
      accent: "yellow",
    },
  ],
  resilienceTrends: {
    title: "Resilience Trends",
    subtitle: "Biological Stability over 4 weeks",
    pills: ["STABLE", "VOLATILITY: LOW"],
    points: [
      { weekLabel: "WEEK 1", value: 0.42 },
      { weekLabel: "WEEK 2", value: 0.52 },
      { weekLabel: "WEEK 3", value: 0.68 },
      { weekLabel: "CURRENT", value: 0.82 },
    ],
  },
  supportiveNote: {
    title: "Supportive Note",
    quote:
      "Shift work is hard. Every anchor point you hit helps your body's internal clock stay grounded.",
    footerLabel: "RESILIENCE INSIGHT",
  },
  bottomInsight: {
    text: "Your recovery trajectory is 12% more stable than last month. Keep focusing on those protected blocks.",
    ctaLabel: "Review Protocol",
  },
};
