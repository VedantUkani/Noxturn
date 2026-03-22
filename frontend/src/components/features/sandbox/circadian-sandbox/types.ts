export type SandboxScheduleBlock = {
  id: string;
  dayTimeLine: string;
  shiftLabel: string;
};

export type SandboxScenarioOption = {
  id: string;
  /** Truncated label shown in the select (matches screenshot ellipsis feel). */
  selectLabel: string;
  insightCallout: string;
  strain: {
    safetyScore: number;
    /** 0–100, arc fill proportion for the ring */
    ringFillPercent: number;
    currentScore: number;
    scenarioScore: number;
    circadianDebtLine: string;
  };
  mitigationItems: SandboxMitigationItem[];
};

export type SandboxMitigationIcon = "moon" | "sun" | "coffee";

export type SandboxMitigationItem = {
  id: string;
  title: string;
  description: string;
  icon: SandboxMitigationIcon;
};

export type SandboxMetricTone = "default" | "coral" | "yellow" | "teal";

export type SandboxMetricStat = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  tone: SandboxMetricTone;
};

export type SandboxHealthStatus = {
  label: string;
  value: string;
};

export type SandboxPageHeading = {
  title: string;
  description: string;
};

export type SandboxActions = {
  acceptLabel: string;
  exploreLabel: string;
};

/** View-model for the Circadian Sandbox page — swap mock for API mapping later. */
export type CircadianSandboxViewModel = {
  heading: SandboxPageHeading;
  healthStatus: SandboxHealthStatus;
  currentScheduleTitle: string;
  scheduleBlocks: SandboxScheduleBlock[];
  newScenarioTitle: string;
  targetShiftLabel: string;
  scenarioOptions: SandboxScenarioOption[];
  defaultScenarioId: string;
  actions: SandboxActions;
  bottomMetrics: SandboxMetricStat[];
};
