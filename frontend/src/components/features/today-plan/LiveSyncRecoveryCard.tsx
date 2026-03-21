"use client";

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
  onEvidenceClick?: () => void;
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
  onEvidenceClick,
}: LiveSyncRecoveryCardProps) {
  const readiness = Math.min(100, Math.max(0, readinessScore));

  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-slate-800/85 via-[#0f1628]/92 to-[#0a1020] p-6",
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

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/65 text-amber-200/90 ring-1 ring-amber-500/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <IconBolt className={todayChipIconClass} aria-hidden />
        </div>
        {liveSync ? (
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/[0.1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/95">
            Live sync
          </span>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Paused
          </span>
        )}
      </div>

      <p className="relative mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
        Updated {fmtUpdated(lastUpdatedIso)}
      </p>

      <p className="relative mt-3 text-[1.875rem] font-bold leading-none tracking-tight text-white md:text-[2.125rem]">
        {hrv}
        <span className="ml-1.5 text-[0.9375rem] font-semibold text-slate-500 md:text-base">
          {metricLabel}
        </span>
      </p>

      <div className="relative mt-4 rounded-xl border border-amber-500/18 bg-amber-950/[0.14] px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <p className="text-[13px] leading-relaxed text-slate-300/95 md:text-sm md:leading-relaxed">
          {message}
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {planRelationLine}
        </p>
      </div>

      <div className="relative mt-auto pt-5 md:pt-6">
        <div className="flex items-baseline justify-between gap-2 text-[12px] md:text-[13px]">
          <span className="font-medium text-slate-400">{readinessLabel}</span>
          <span className="shrink-0 font-semibold tabular-nums text-slate-200">
            {readiness}
            <span className="text-slate-500">/100</span>
          </span>
        </div>
        <div
          className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-slate-900/95 ring-1 ring-white/[0.07]"
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

      {onEvidenceClick ? (
        <button
          type="button"
          onClick={onEvidenceClick}
          className="relative mt-3 text-left text-[11px] font-medium text-teal-300/85 underline-offset-4 hover:underline"
        >
          Evidence lens — recovery signal
        </button>
      ) : null}

      {onSelectBand ? (
        <div className="relative mt-4 border-t border-white/[0.06] pt-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
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
                    ? "border-teal-400/45 bg-teal-400/10 text-teal-100"
                    : "border-slate-700/60 bg-slate-950/30 text-slate-400 hover:border-slate-600 hover:text-slate-200",
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
