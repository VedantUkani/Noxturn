import { RecoveryHeader } from "./RecoveryHeader";
import { RhythmSnapshotCard } from "./RhythmSnapshotCard";
import { ProtectedBlocksCard } from "./ProtectedBlocksCard";
import { MetricProgressCard } from "./MetricProgressCard";
import { ResilienceTrendsCard } from "./ResilienceTrendsCard";
import { SupportiveNoteCard } from "./SupportiveNoteCard";
import { RecoveryInsightBar } from "./RecoveryInsightBar";
import type { RecoveryAnalyticsViewModel } from "./types";

type RecoveryAnalyticsPageProps = {
  data: RecoveryAnalyticsViewModel;
};

export function RecoveryAnalyticsPage({ data }: RecoveryAnalyticsPageProps) {
  const [m1, m2] = data.metrics;

  return (
    <div className="min-h-0 flex-1">
      <RecoveryHeader header={data.header} />

      <div className="flex flex-col gap-7 lg:gap-8">
        <RhythmSnapshotCard snapshot={data.snapshot} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7 lg:items-stretch">
          <div className="lg:col-span-8">
            <ProtectedBlocksCard data={data.protectedBlocks} />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4">
            {m1 ? <MetricProgressCard metric={m1} /> : null}
            {m2 ? <MetricProgressCard metric={m2} /> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-7 lg:items-stretch">
          <div className="lg:col-span-8">
            <ResilienceTrendsCard data={data.resilienceTrends} />
          </div>
          <div className="lg:col-span-4">
            <SupportiveNoteCard data={data.supportiveNote} />
          </div>
        </div>

        <RecoveryInsightBar data={data.bottomInsight} />
      </div>
    </div>
  );
}
