"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchDashboardToday } from "@/lib/noxturn-api";
import { getOrCreateUserId } from "@/lib/session";
import {
  payloadFromDashboardApi,
  payloadFromDemo,
} from "@/lib/mocks/today-dashboard-payload";
import type { TodayDashboardPayload } from "@/lib/dashboard-types";
import { TodayDashboardProvider } from "@/contexts/TodayDashboardContext";
import { TodayDashboardView } from "@/components/dashboard/TodayDashboardView";

export function TodayPageClient() {
  const [boot, setBoot] = useState(0);
  const [initial, setInitial] = useState<TodayDashboardPayload>(payloadFromDemo);

  useEffect(() => {
    const userId = getOrCreateUserId();
    if (!userId) return;

    let cancelled = false;

    void (async () => {
      try {
        const d = await fetchDashboardToday(userId);
        if (cancelled) return;
        setInitial(payloadFromDashboardApi(d));
        setBoot((k) => k + 1);
      } catch (e) {
        if (cancelled) return;
        setInitial(payloadFromDemo());
        setBoot((k) => k + 1);
        if (process.env.NODE_ENV === "development" && e instanceof ApiError) {
          console.warn("[Noxturn] /dashboard/today:", e.status, e.message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TodayDashboardProvider key={boot} initial={initial}>
      <TodayDashboardView />
    </TodayDashboardProvider>
  );
}
