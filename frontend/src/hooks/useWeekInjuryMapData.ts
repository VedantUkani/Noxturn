"use client";

import { useMemo } from "react";
import { buildDemoWeekInjuryMap } from "@/lib/mocks/week-injury-map-mock";
import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";

/**
 * Week screen data. Today this returns typed demo data; swap the implementation
 * for `mapRiskComputeToWeekView` + fetch when `/risks/compute` is wired for the user.
 */
export function useWeekInjuryMapData(): CircadianInjuryMapData {
  return useMemo(() => buildDemoWeekInjuryMap(), []);
}
