"use client";

import { useMemo } from "react";
import { commuteRecoveryHintHours } from "../commute-utils";
import type { OnboardingDraft } from "../types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const MINUTE_CHIPS = [15, 30, 45, 60, 75, 90] as const;

type CommuteStepProps = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function CommuteStep({ draft, onChange }: CommuteStepProps) {
  const hintHours = useMemo(
    () => commuteRecoveryHintHours(draft.commuteMinutes),
    [draft.commuteMinutes],
  );

  return (
    <div className={cn(nx.card, "p-6")}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={nx.labelUpper}>One-way commute</p>
          <p className="mt-2 text-sm text-[#98a4bf]">
            Used to estimate rest time between shifts (same model as the classic
            onboarding flow).
          </p>
        </div>
        <span className="text-lg font-semibold tabular-nums text-[#edf2ff]">
          {draft.commuteMinutes} min
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={120}
        step={5}
        value={draft.commuteMinutes}
        onChange={(e) =>
          onChange({ commuteMinutes: Number.parseInt(e.target.value, 10) })
        }
        className="h-2 w-full cursor-pointer accent-[#45e0d4]"
        aria-valuemin={0}
        aria-valuemax={120}
        aria-valuenow={draft.commuteMinutes}
        aria-label="One-way commute in minutes"
      />
      <div className="mt-1 flex justify-between text-xs text-[#7d89a6]">
        <span>0 min</span>
        <span>120 min</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {MINUTE_CHIPS.map((m) => {
          const active = draft.commuteMinutes === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ commuteMinutes: m })}
              className={cn(
                "rounded-2xl border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                active
                  ? "border-[#45e0d4]/40 bg-[#0c1f3d] text-[#45e0d4]"
                  : "border-white/[0.08] text-[#98a4bf] hover:bg-white/[0.04]",
                nx.focusRing,
              )}
            >
              {m} min
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#101c3c]/60 px-3 py-2.5 text-xs leading-relaxed text-[#7d89a6]">
        With a{" "}
        <span className="font-medium text-[#edf2ff]">
          {draft.commuteMinutes} minute
        </span>{" "}
        commute, you need at least{" "}
        <span className="font-medium text-[#edf2ff]">{hintHours}h</span> between
        shifts to avoid a short-turnaround risk episode.
      </div>
    </div>
  );
}
