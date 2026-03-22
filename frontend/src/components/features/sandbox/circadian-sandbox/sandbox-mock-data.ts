import type { CircadianSandboxViewModel } from "./types";

/** Primary mock — matches the reference screenshot. */
const primaryScenarioId = "night-shift-mon";

export const SANDBOX_MOCK_VIEW_MODEL: CircadianSandboxViewModel = {
  heading: {
    title: "Shift Sandbox: Scenario Planning",
    description:
      "Model the physiological impact of schedule changes before committing to them. Guard your circadian health.",
  },
  healthStatus: {
    label: "HEALTH STATUS",
    value: "Optimal Recovering",
  },
  currentScheduleTitle: "Current Schedule",
  scheduleBlocks: [
    {
      id: "sb-1",
      dayTimeLine: "MONDAY 08:00 - 17:00",
      shiftLabel: "Standard Day Shift",
    },
    {
      id: "sb-2",
      dayTimeLine: "TUESDAY 08:00 - 17:00",
      shiftLabel: "Standard Day Shift",
    },
  ],
  newScenarioTitle: "New Scenario",
  targetShiftLabel: "Target Shift",
  defaultScenarioId: primaryScenarioId,
  scenarioOptions: [
    {
      id: primaryScenarioId,
      selectLabel: "Monday 22:00 - C...",
      insightCallout:
        "Switching to night shifts triggers immediate rhythm phase-delay.",
      strain: {
        safetyScore: 64,
        ringFillPercent: 64,
        currentScore: 82,
        scenarioScore: 64,
        circadianDebtLine: "Predicted Circadian Debt: +4.2 Hours over 48h",
      },
      mitigationItems: [
        {
          id: "m1",
          title: "90-min Anchor Nap",
          description:
            "Between 16:00 - 17:30 Monday. Crucial for pre-night shift cognitive stability.",
          icon: "moon",
        },
        {
          id: "m2",
          title: "Bright Light Exposure",
          description:
            "Tuesday morning 07:00 - 08:30. Reset phase response using 10k Lux therapy.",
          icon: "sun",
        },
        {
          id: "m3",
          title: "Caffeine Tapering",
          description:
            "Last intake no later than 02:00 AM during shift to preserve recovery sleep.",
          icon: "coffee",
        },
      ],
    },
    {
      id: "swing-shift",
      selectLabel: "Wednesday 14:00 - ...",
      insightCallout:
        "Swing transitions compress recovery windows — expect elevated sleep inertia.",
      strain: {
        safetyScore: 71,
        ringFillPercent: 56,
        currentScore: 82,
        scenarioScore: 71,
        circadianDebtLine: "Predicted Circadian Debt: +2.1 Hours over 48h",
      },
      mitigationItems: [
        {
          id: "m1b",
          title: "Strategic Nap Window",
          description:
            "Between 10:00 - 11:00 Wednesday. Limits acute vigilance dips before the swing block.",
          icon: "moon",
        },
        {
          id: "m2b",
          title: "Morning Light Anchor",
          description:
            "Thursday 06:30 - 07:30. Preserve entrainment cues through the transition.",
          icon: "sun",
        },
        {
          id: "m3b",
          title: "Caffeine Tapering",
          description:
            "Stop caffeine 6 hours before planned sleep to protect sleep onset latency.",
          icon: "coffee",
        },
      ],
    },
    {
      id: "early-start",
      selectLabel: "Thursday 05:00 - ...",
      insightCallout:
        "Early starts advance circadian phase — watch for afternoon crash risk.",
      strain: {
        safetyScore: 76,
        ringFillPercent: 48,
        currentScore: 82,
        scenarioScore: 76,
        circadianDebtLine: "Predicted Circadian Debt: +1.4 Hours over 48h",
      },
      mitigationItems: [
        {
          id: "m1c",
          title: "Pre-shift Sleep Extension",
          description:
            "Target 90 extra minutes the night prior to buffer sleep debt before the early block.",
          icon: "moon",
        },
        {
          id: "m2c",
          title: "Bright Light Exposure",
          description:
            "Within 30 minutes of wake — use outdoor light or 10k Lux therapy.",
          icon: "sun",
        },
        {
          id: "m3c",
          title: "Caffeine Tapering",
          description:
            "Front-load caffeine before noon to avoid late-cycle stimulation.",
          icon: "coffee",
        },
      ],
    },
  ],
  actions: {
    acceptLabel: "Accept Scenario",
    exploreLabel: "Explore Safer Alternatives",
  },
  bottomMetrics: [
    {
      id: "rx",
      label: "REACTION SPEED",
      primary: "-15%",
      secondary: "Estimated",
      tone: "default",
    },
    {
      id: "meta",
      label: "METABOLIC STRESS",
      primary: "High",
      secondary: "Cortisol Peak",
      tone: "yellow",
    },
    {
      id: "cog",
      label: "COGNITIVE LOAD",
      primary: "Moderate",
      secondary: "Risk Tier",
      tone: "default",
    },
    {
      id: "rec",
      label: "RECOVERY TIME",
      primary: "36h",
      secondary: "To Baseline",
      tone: "teal",
    },
  ],
};
