/**
 * Static demo payload for the Today dashboard (local / story-style).
 * Hero lines like “Prioritize Napping” / “Before 14:00” are not final — production
 * uses `next_best_action` from the dashboard API (Claude planner JSON),
 * mapped in `nextBestFromApi` in `mocks/today-dashboard-payload.ts`.
 */

export type TodayRecommendationId = "sleep" | "light" | "caffeine";

export type TodayRecommendation = {
  id: TodayRecommendationId;
  title: string;
  value: string;
  note: string;
};

export type TodayAvoidanceGlyph = "snack" | "stride";

export type TodayAvoidanceItem = {
  id: string;
  title: string;
  detail: string;
  icon: TodayAvoidanceGlyph;
};

export type TodayNextBestAction = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
};

/** Live card: optional `metricLabel` when showing backend recovery score instead of HRV. */
export type TodayVitals = {
  hrv: number;
  liveSync: boolean;
  message: string;
  readinessScore: number;
  metricLabel?: string;
};

/** Full Today page payload — demo or API-mapped. */
export type TodayViewModel = {
  nextBestAction: TodayNextBestAction;
  vitals: TodayVitals;
  recommendations: readonly TodayRecommendation[];
  avoid: readonly TodayAvoidanceItem[];
};

export const todayDemo: TodayViewModel = {
  nextBestAction: {
    eyebrow: "Next best action",
    titleLine1: "Prioritize Napping",
    titleLine2: "Before 14:00",
    body: "Shift starts at 19:00. This recovery window has the highest payoff for alertness and overnight stability.",
    primaryCta: "Start Recovery Timer",
    secondaryCta: "Set Reminder",
  },
  vitals: {
    hrv: 32,
    liveSync: true,
    message:
      "Low Heart Rate Variability detected — your nervous system is under strain. Prioritize immediate rest over active preparation.",
    readinessScore: 42,
  },
  recommendations: [
    {
      id: "sleep",
      title: "Sleep Block",
      value: "10:00 - 15:00",
      note: "A consistent anchor before nights supports both alertness on shift and sleep after.",
    },
    {
      id: "light",
      title: "Light Timing",
      value: "Immediate Morning Sunlight",
      note: "Gentle outdoor light early helps signal “day” without overstimulation.",
    },
    {
      id: "caffeine",
      title: "Caffeine Cutoff",
      value: "By 13:00 Today",
      note: "An earlier cutoff leaves more room for sleep pressure when you finally wind down.",
    },
  ],
  avoid: [
    {
      id: "sugar",
      title: "High-sugar snacks after 16:00",
      detail:
        "Big glucose swings late in the day can stack on top of a narrower melatonin window—steady fuel tends to feel steadier.",
      icon: "snack",
    },
    {
      id: "cardio",
      title: "Intense cardio before sleep",
      detail:
        "Elevated core temperature can take a while to fall—if sleep is the goal, a lighter wind-down usually fits better.",
      icon: "stride",
    },
  ],
};
