export type RecoverySnapshotModel = {
  headlineLead: string;
  protectedCount: number;
  protectedTotal: number;
  headlineTrail: string;
  microLabel: string;
};

export type RecoveryProtectedBlocksModel = {
  title: string;
  subtitle: string;
  weekdayLabels: readonly string[];
};

export type RecoveryMetricModel = {
  id: string;
  label: string;
  percent: number;
  accent: "lightBlue" | "yellow";
};

export type ResilienceTrendPoint = {
  weekLabel: string;
  /** Normalized 0–1 value for chart Y position */
  value: number;
};

export type RecoveryResilienceTrendsModel = {
  title: string;
  subtitle: string;
  pills: readonly string[];
  points: readonly ResilienceTrendPoint[];
};

export type RecoverySupportiveNoteModel = {
  title: string;
  quote: string;
  footerLabel: string;
};

export type RecoveryBottomInsightModel = {
  text: string;
  ctaLabel: string;
};

export type RecoveryPageHeaderModel = {
  titleWhite: string;
  titleAccent: string;
};

export type RecoveryAnalyticsViewModel = {
  header: RecoveryPageHeaderModel;
  snapshot: RecoverySnapshotModel;
  protectedBlocks: RecoveryProtectedBlocksModel;
  metrics: readonly RecoveryMetricModel[];
  resilienceTrends: RecoveryResilienceTrendsModel;
  supportiveNote: RecoverySupportiveNoteModel;
  bottomInsight: RecoveryBottomInsightModel;
};
