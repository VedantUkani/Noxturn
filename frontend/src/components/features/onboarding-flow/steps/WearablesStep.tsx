"use client";

import { useState } from "react";
import type { OnboardingDraft } from "../types";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function WearablesStep({ draft, onChange }: Props) {
  const [showOuraInfo, setShowOuraInfo] = useState(false);

  const handleConnect = () => {
    // In production: redirect to Oura OAuth
    // https://cloud.ouraring.com/oauth/authorize?client_id=...
    setShowOuraInfo(true);
  };

  const handleDisconnect = () => {
    onChange({ ouraConnected: false });
  };

  const handleSkip = () => {
    onChange({ wearablesSkipped: true });
  };

  return (
    <div className="space-y-4">
      <div className={cn("rounded-[22px] border p-5 sm:p-6 transition-all", draft.ouraConnected
        ? "border-[#45e0d4]/40 bg-[#0c2a3d]"
        : "border-white/[0.06] bg-[#141f42]/60"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0d1833] border border-white/[0.08]">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#45e0d4" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="5" stroke="#45e0d4" strokeWidth="1.5" strokeDasharray="2 2"/>
              <circle cx="12" cy="12" r="2" fill="#45e0d4"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#edf2ff]">Oura Ring</p>
            <p className="text-xs text-[#7d89a6]">
              {draft.ouraConnected
                ? "Connected — sleep & recovery data syncing"
                : "Sleep stages, HRV, readiness score"}
            </p>
          </div>
          {draft.ouraConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#45e0d4]/30 bg-[#45e0d4]/10 px-2.5 py-1 text-xs font-medium text-[#45e0d4]">
                Connected
              </span>
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-[#7d89a6] hover:text-[#ff8a8a] transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className={cn(
                "shrink-0 rounded-xl border border-[#45e0d4]/30 bg-[#0c1f3d] px-4 py-2 text-sm font-medium text-[#45e0d4]",
                "hover:border-[#45e0d4]/60 hover:bg-[#0c2a3d] transition-all",
                nx.focusRing,
              )}
            >
              Connect
            </button>
          )}
        </div>

        {showOuraInfo && !draft.ouraConnected && (
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0d1833]/80 p-4 space-y-3">
            <p className="text-sm font-medium text-[#edf2ff]">Connect your Oura Ring</p>
            <p className="text-xs leading-relaxed text-[#98a4bf]">
              To connect, you need an Oura account with a paired ring. Visit{" "}
              <a
                href="https://cloud.ouraring.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#45e0d4] underline underline-offset-2"
              >
                cloud.ouraring.com
              </a>{" "}
              to sign up. Once connected, Noxturn reads your sleep stages, HRV, and readiness score to adapt your plan automatically.
            </p>
            <div className="flex gap-2">
              <a
                href="https://cloud.ouraring.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border border-[#45e0d4]/30 bg-[#0c1f3d] px-4 py-2 text-sm font-medium text-[#45e0d4]",
                  "hover:border-[#45e0d4]/60 hover:bg-[#0c2a3d] transition-all",
                )}
              >
                Get Oura Ring
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                type="button"
                onClick={() => {
                  // Simulate connected for demo
                  onChange({ ouraConnected: true, wearablesSkipped: false });
                  setShowOuraInfo(false);
                }}
                className="rounded-xl border border-white/[0.08] bg-[#141f42] px-4 py-2 text-sm text-[#98a4bf] hover:text-[#edf2ff] transition-colors"
              >
                I have an account →
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[22px] border border-white/[0.04] bg-[#0d1530]/40 p-4">
        <p className="text-xs text-[#7d89a6] leading-relaxed">
          <span className="font-medium text-[#98a4bf]">Why connect a wearable?</span>{" "}
          Noxturn uses your sleep and HRV data to automatically switch between Protect, Recover, Stabilize, and Perform modes — giving you a plan that adapts to how you actually slept, not just your schedule.
        </p>
      </div>

      {!draft.ouraConnected && (
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
