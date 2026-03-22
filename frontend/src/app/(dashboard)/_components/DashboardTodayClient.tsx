"use client";

import { TodayPageClient } from "@/components/features/today-plan/TodayPageClient";

/** Client boundary for Today + /dashboard — keeps route `page.tsx` as a Server Component. */
export function DashboardTodayClient() {
  return <TodayPageClient />;
}
