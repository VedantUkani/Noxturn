import type { Metadata } from "next";
import { RecoveryPageClient } from "@/components/features/recovery-analytics/RecoveryPageClient";

export const metadata: Metadata = {
  title: "Recovery",
  description: "Recovery rhythm analytics and resilience trends.",
};

export default function RecoveryPage() {
  return <RecoveryPageClient />;
}
