"use client";

import { useState } from "react";
import type { OnboardingDraft } from "../types";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import { connectFitbit, disconnectFitbit } from "@/lib/fitbitOAuth";

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

// Fitbit icon
const FitbitIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="4"  r="1.8" fill="#45e0d4" />
    <circle cx="12" cy="9"  r="2.2" fill="#45e0d4" />
    <circle cx="12" cy="15" r="2.8" fill="#45e0d4" />
    <circle cx="12" cy="21" r="1.8" fill="#45e0d4" opacity="0.5" />
    <circle cx="6"  cy="7"  r="1.4" fill="#45e0d4" opacity="0.6" />
    <circle cx="18" cy="7"  r="1.4" fill="#45e0d4" opacity="0.6" />
    <circle cx="6"  cy="13" r="1.6" fill="#45e0d4" opacity="0.5" />
    <circle cx="18" cy="13" r="1.6" fill="#45e0d4" opacity="0.5" />
  </svg>
);

// Oura icon (coming soon)
const OuraIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#7d89a6" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" stroke="#7d89a6" strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="2" fill="#7d89a6" />
  </svg>
);

// Apple icon (coming soon)
const AppleIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
    <path d="M12 21C12 21 4 16 4 10.5C4 7.46 6.46 5 9.5 5C10.74 5 11.91 5.43 12.83 6.17C13.09 5.97 13.38 5.8 13.68 5.66C14.24 5.4 14.86 5.25 15.5 5.25C17.57 5.25 19.27 6.68 19.79 8.59"
      stroke="#7d89a6" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 8C17 8 20 9.5 20 13C20 16 17 19 12 21" stroke="#7d89a6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function WearablesStep({ draft, onChange }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleFitbitConnect = async () => {
    setConnectError(null);
    setConnecting(true);
    try {
      await connectFitbit();
      onChange({ fitbitConnected: true, wearablesSkipped: false });
    } catch (e) {
      setConnectError((e as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const handleFitbitDisconnect = () => {
    disconnectFitbit();
    onChange({ fitbitConnected: false });
  };

  const handleSkip = () => onChange({ wearablesSkipped: true });

  return (
    <div className="space-y-3">

      {/* ── Fitbit (real OAuth) ───────────────────────────────────── */}
      <div className={cn(
        "rounded-[22px] border p-5 transition-all duration-150",
        draft.fitbitConnected
          ? "border-[#45e0d4]/40 bg-[#0c2a3d]"
          : "border-white/[0.06] bg-[#141f42]/60",
      )}>
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0d1833]">
            <FitbitIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#edf2ff]">Fitbit</p>
            <p className="mt-0.5 text-xs text-[#7d89a6]">
              {draft.fitbitConnected
                ? "Connected — sleep, HRV & activity syncing"
                : "Sleep stages, heart rate, activity & HRV"}
            </p>
          </div>

          {draft.fitbitConnected ? (
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full border border-[#45e0d4]/30 bg-[#45e0d4]/10 px-2.5 py-1 text-xs font-medium text-[#45e0d4]">
                Connected
              </span>
              <button
                type="button"
                onClick={handleFitbitDisconnect}
                className="text-xs text-[#7d89a6] hover:text-[#ff8a8a] transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleFitbitConnect}
              disabled={connecting}
              className={cn(
                "shrink-0 rounded-xl border border-[#45e0d4]/30 bg-[#0c1f3d] px-4 py-2 text-sm font-medium text-[#45e0d4]",
                "hover:border-[#45e0d4]/60 hover:bg-[#0c2a3d] transition-all disabled:opacity-50",
                nx.focusRing,
              )}
            >
              {connecting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Connecting…
                </span>
              ) : "Connect"}
            </button>
          )}
        </div>

        {connectError && (
          <p className="mt-3 rounded-xl border border-red-800/40 bg-red-950/35 px-3 py-2 text-xs text-red-300">
            {connectError}
          </p>
        )}
      </div>

      {/* ── Oura Ring (coming soon) ───────────────────────────────── */}
      <div className="rounded-[22px] border border-white/[0.04] bg-[#0d1530]/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.05] bg-[#0d1833]/50">
            <OuraIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#5c6a85]">Oura Ring</p>
              <span className="rounded-full border border-white/[0.1] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5c6a85]">
                Coming soon
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#3d4a65]">Sleep stages, HRV, readiness score</p>
          </div>
          <span className="shrink-0 rounded-xl border border-white/[0.05] px-4 py-2 text-sm text-[#3d4a65] cursor-not-allowed">
            Connect
          </span>
        </div>
      </div>

      {/* ── Apple Health (coming soon) ────────────────────────────── */}
      <div className="rounded-[22px] border border-white/[0.04] bg-[#0d1530]/40 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.05] bg-[#0d1833]/50">
            <AppleIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#5c6a85]">Apple Health</p>
              <span className="rounded-full border border-white/[0.1] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5c6a85]">
                Coming soon
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#3d4a65]">Sleep & steps via HealthKit</p>
          </div>
          <span className="shrink-0 rounded-xl border border-white/[0.05] px-4 py-2 text-sm text-[#3d4a65] cursor-not-allowed">
            Connect
          </span>
        </div>
      </div>

      {/* ── Skip ─────────────────────────────────────────────────── */}
      {!draft.fitbitConnected && (
        <button
          type="button"
          onClick={handleSkip}
          className="w-full rounded-[22px] border border-white/[0.06] bg-transparent py-3 text-sm text-[#7d89a6] hover:text-[#98a4bf] hover:border-white/[0.1] transition-all"
        >
          {draft.wearablesSkipped ? "✓ Skipping for now" : "I'll connect a wearable later"}
        </button>
      )}
    </div>
  );
}
