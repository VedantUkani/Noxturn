import type { Metadata } from "next";
import { RecoveryAnalyticsPage } from "@/components/features/recovery-analytics";
import { mockRecoveryAnalyticsViewModel } from "@/components/features/recovery-analytics/mock-data";

export const metadata: Metadata = {
  title: "Recovery",
  description: "Recovery rhythm analytics and resilience trends.",
};

export default function RecoveryPage() {
  return <RecoveryAnalyticsPage data={mockRecoveryAnalyticsViewModel} />;
}
