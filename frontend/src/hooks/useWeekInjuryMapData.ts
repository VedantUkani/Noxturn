"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { postRisksCompute } from "@/lib/noxturn-api";
import {
  ensureBackendAuth,
  getOrCreateUserId,
  getStoredScheduleBlocks,
} from "@/lib/session";
import { mapRiskComputeToWeekView } from "@/lib/adapters/week-risk-map-adapter";
import type { CircadianInjuryMapData } from "@/lib/week-risk-view-model";

export type WeekDataPhase = "loading" | "ready" | "empty" | "error";

export type WeekDataState = {
  phase: WeekDataPhase;
  data: CircadianInjuryMapData | null;
  errorMsg: string | null;
};

function getCommuteMinutes(): number {
  try {
    const raw = localStorage.getItem("noxturn_profile");
    if (!raw) return 30;
    const p = JSON.parse(raw) as { commuteMinutes?: number };
    return p.commuteMinutes ?? 30;
  } catch {
    return 30;
  }
}

/**
 * Fetches risk data from `/risks/compute` using the stored schedule blocks
 * and maps the result into the CircadianInjuryMapData view model.
 */
export function useWeekInjuryMapData(): WeekDataState {
  const [state, setState] = useState<WeekDataState>({
    phase: "loading",
    data: null,
    errorMsg: null,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await ensureBackendAuth();

        const blocks = getStoredScheduleBlocks();
        if (blocks.length === 0) {
          if (!cancelled) setState({ phase: "empty", data: null, errorMsg: null });
          return;
        }

        const userId = getOrCreateUserId();
        const commuteMinutes = getCommuteMinutes();

        const risk = await postRisksCompute({
          user_id: userId,
          blocks,
          commute_minutes: commuteMinutes,
        });

        if (cancelled) return;

        const data = mapRiskComputeToWeekView(risk, blocks);
        setState({ phase: "ready", data, errorMsg: null });
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? `API error ${e.status}: ${e.message}`
            : e instanceof Error
            ? e.message
            : "Could not load week data.";
        setState({ phase: "error", data: null, errorMsg: msg });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
