"use client";

/**
 * Recovery / readiness strip. Copy and “LIVE SYNC” state mirror API vitals from the
 * planner pipeline; band buttons on the right are demo controls that only tweak
 * local `dashboard-live` simulation, not production agent output.
 */

import { IconBolt } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";
import type { RecoverySimulationBand } from "@/lib/dashboard-types";
import { todayCardShell, todayChipIconClass } from "./today-surfaces";

export type LiveSyncRecoveryCardProps = {
  /** Primary recovery metric (e.g. HRV). */
  hrv: number;
  /** When true, shows the LIVE SYNC badge. */
  liveSync: boolean;
  /** Short explanation (low recovery / nervous system load). */
  message: string;
  /** Readiness 0–100; clamped internally. */
  readinessScore: number;
  /** Metric suffix label, default HRV. */
  metricLabel?: string;
  /** Row label above the progress bar. */
  readinessLabel?: string;
  /** ISO time of last vitals update. */
  lastUpdatedIso?: string;
  /** Mock recovery posture for demos. */
  recoveryBand?: RecoverySimulationBand;
  /** How readiness relates to the current near-term plan. */
  planRelationLine?: string;
  className?: string;
  onSelectBand?: (band: RecoverySimulationBand) => void;
};

function fmtUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function bandLabel(b: RecoverySimulationBand): string {
  switch (b) {
    case "stable":
      return "Stable";
    case "low_recovery":
      return "Low recovery";
    case "severe_strain":
      return "Severe strain";
    default:
      return b;
  }
}

export function LiveSyncRecoveryCard({
  hrv,
  liveSync,
  message,
  readinessScore,
  metricLabel = "HRV",
  readinessLabel = "Readiness score",
  lastUpdatedIso = new Date().toISOString(),
  recoveryBand = "stable",
  planRelationLine = "Readiness supports your current anchors — optional steps stay available.",
  className,
  onSelectBand,
}: LiveSyncRecoveryCardProps) {
  const readiness = Math.min(100, Math.max(0, readinessScore));

  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-[#141f42] via-[#101c3c] to-[#0c1734] p-6",
        todayCardShell,
        className,
      )}
      aria-label="Live recovery signals"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-500/[0.07] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-rose-500/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7c22c]/10 text-[#f7c22c] ring-1 ring-[#f7c22c]/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <IconBolt className={todayChipIconClass} aria-hidden />
        </div>
      </div>

      <p className="relative mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
        Updated {fmtUpdated(lastUpdatedIso)}
      </p>

      <p className="relative mt-3 text-[1.875rem] font-bold leading-none tracking-tight text-[#edf2ff] md:text-[2.125rem]">
        {hrv}
        <span className="ml-1.5 text-[0.9375rem] font-semibold text-[#7d89a6] md:text-base">
          {metricLabel}
        </span>
      </p>

      <div className="relative mt-4 rounded-xl border border-[#f7c22c]/18 bg-[#f7c22c]/[0.08] px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <p className="text-[13px] leading-relaxed text-[#edf2ff]/95 md:text-sm md:leading-relaxed">
          {message}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#98a4bf]">
          {planRelationLine}
        </p>
      </div>

      <div className="relative mt-auto pt-5 md:pt-6">
        <div className="flex items-baseline justify-between gap-2 text-[12px] md:text-[13px]">
          <span className="font-medium text-[#98a4bf]">{readinessLabel}</span>
          <span className="shrink-0 font-semibold tabular-nums text-[#edf2ff]">
            {readiness}
            <span className="text-[#7d89a6]">/100</span>
          </span>
        </div>
        <div
          className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-[#0d1833] ring-1 ring-white/[0.07]"
          role="progressbar"
          aria-valuenow={readiness}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${readiness} out of 100`}
          aria-label={readinessLabel}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600/85 via-amber-500/75 to-amber-400/65 shadow-[0_0_16px_-4px_rgba(251,191,36,0.35)] transition-[width] duration-500 ease-out"
            style={{ width: `${readiness}%` }}
          />
        </div>
      </div>

      {onSelectBand ? (
        <div className="relative mt-4 border-t border-white/[0.06] pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
            Demo recovery signal
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              ["stable", "low_recovery", "severe_strain"] as RecoverySimulationBand[]
            ).map((band) => (
              <button
                key={band}
                type="button"
                onClick={() => onSelectBand(band)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  recoveryBand === band
                    ? "border-[#45e0d4]/45 bg-[#45e0d4]/10 text-[#45e0d4]"
                    : "border-white/[0.1] bg-[#101c3c]/80 text-[#98a4bf] hover:border-white/[0.16] hover:text-[#edf2ff]",
                )}
              >
                {bandLabel(band)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
