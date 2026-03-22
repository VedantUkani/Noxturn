"use client";

import { commuteRecoveryHintHours } from "@/components/features/onboarding-flow/commute-utils";
import type { TransportMode } from "@/lib/user-profile-settings";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const MINUTE_CHIPS = [15, 30, 45, 60, 75, 90] as const;

const TRANSPORT: { id: TransportMode; label: string }[] = [
  { id: "car", label: "Car" },
  { id: "transit", label: "Transit" },
  { id: "walk_cycle", label: "Walk / cycle" },
  { id: "other", label: "Other" },
];

type CommuteEditorProps = {
  minutes: number;
  transportMode: TransportMode;
  onMinutesChange: (n: number) => void;
  onTransportChange: (t: TransportMode) => void;
  error?: string;
  disabled?: boolean;
};

export function CommuteEditor({
  minutes,
  transportMode,
  onMinutesChange,
  onTransportChange,
  error,
  disabled,
}: CommuteEditorProps) {
  const hintHours = useMemo(() => commuteRecoveryHintHours(minutes), [minutes]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-[#98a4bf]">
          One-way travel time informs rest buffers between shifts.
        </p>
        <span className="text-lg font-semibold tabular-nums text-[#45e0d4]">
          {minutes} min
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={120}
        step={5}
        disabled={disabled}
        value={minutes}
        onChange={(e) =>
          onMinutesChange(Number.parseInt(e.target.value, 10))
        }
        className="h-2 w-full cursor-pointer accent-[#45e0d4] disabled:opacity-50"
        aria-valuemin={0}
        aria-valuemax={120}
        aria-valuenow={minutes}
        aria-label="Commute duration in minutes"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "commute-error" : "commute-hint"}
      />
      <div className="flex justify-between text-xs text-[#7d89a6]">
        <span>0 min</span>
        <span>120 min</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MINUTE_CHIPS.map((m) => {
          const active = minutes === m;
          return (
            <button
              key={m}
              type="button"
              disabled={disabled}
              onClick={() => onMinutesChange(m)}
              className={cn(
                "rounded-2xl border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                active
                  ? "border-[#45e0d4]/40 bg-[#0c1f3d] text-[#45e0d4]"
                  : "border-white/[0.08] text-[#98a4bf] hover:bg-white/[0.04]",
                nx.focusRing,
                disabled && "pointer-events-none opacity-50",
              )}
            >
              {m} min
            </button>
          );
        })}
      </div>

      <div>
        <label htmlFor="transport-mode" className={nx.labelUpper}>
          Typical transport
        </label>
        <select
          id="transport-mode"
          disabled={disabled}
          value={transportMode}
          onChange={(e) =>
            onTransportChange(e.target.value as TransportMode)
          }
          className={cn(
            "mt-3 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
            "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
            disabled && "opacity-50",
          )}
        >
          {TRANSPORT.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p id="commute-error" className="text-sm text-[#ff8a8a]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
