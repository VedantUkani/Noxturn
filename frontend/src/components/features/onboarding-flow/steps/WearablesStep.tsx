"use client";

import { useState } from "react";
import type { OnboardingDraft } from "../types";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

type WearableId = "oura" | "whoop" | "apple";

type WearableConfig = {
  id: WearableId;
  name: string;
  detail: string;
  icon: React.ReactNode;
  connectUrl?: string;
};

const WEARABLES: WearableConfig[] = [
  {
    id: "oura",
    name: "Oura Ring",
    detail: "Sleep stages, HRV, readiness score",
    connectUrl: "https://cloud.ouraring.com",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#45e0d4" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" stroke="#45e0d4" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="2" fill="#45e0d4" />
      </svg>
    ),
  },
  {
    id: "whoop",
    name: "Whoop 4.0",
    detail: "Strain, recovery, sleep performance",
    connectUrl: "https://app.whoop.com",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="8" rx="4" stroke="#f4c22b" strokeWidth="1.5" />
        <path d="M8 12h2l1.5-2 1.5 4 1.5-2H18" stroke="#f4c22b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "apple",
    name: "Apple Health",
    detail: "Sleep & Steps sync via HealthKit",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 4 16 4 10.5C4 7.46 6.46 5 9.5 5C10.74 5 11.91 5.43 12.83 6.17C13.09 5.97 13.38 5.8 13.68 5.66C14.24 5.4 14.86 5.25 15.5 5.25C17.57 5.25 19.27 6.68 19.79 8.59" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 8C17 8 20 9.5 20 13C20 16 17 19 12 21" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

type ConnectedMap = Partial<Record<WearableId, boolean>>;

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function WearablesStep({ draft, onChange }: Props) {
  const [connected, setConnected] = useState<ConnectedMap>({
    oura: draft.ouraConnected,
  });
  const [expandedInfo, setExpandedInfo] = useState<WearableId | null>(null);

  const handleConnect = (id: WearableId, url?: string) => {
    if (expandedInfo === id) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo(id);
    }
    if (url) {
      // In production this would redirect to OAuth — show info panel for demo
    }
  };

  const handleSimulateConnect = (id: WearableId) => {
    const next = { ...connected, [id]: true };
    setConnected(next);
    setExpandedInfo(null);
    onChange({ ouraConnected: next.oura ?? false });
  };

  const handleDisconnect = (id: WearableId) => {
    const next = { ...connected, [id]: false };
    setConnected(next);
    if (id === "oura") onChange({ ouraConnected: false });
  };

  const handleSkip = () => {
    onChange({ wearablesSkipped: true });
  };

  const anyConnected = Object.values(connected).some(Boolean);

  return (
    <div className="space-y-3">
      {WEARABLES.map((w) => {
        const isConnected = !!connected[w.id];
        const isExpanded = expandedInfo === w.id;

        return (
          <div
            key={w.id}
            className={cn(
              "rounded-[22px] border p-5 transition-all duration-150",
              isConnected
                ? "border-[#45e0d4]/40 bg-[#0c2a3d]"
                : "border-white/[0.06] bg-[#141f42]/60",
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0d1833]">
                {w.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#edf2ff]">{w.name}</p>
                <p className="mt-0.5 text-xs text-[#7d89a6]">
                  {isConnected
                    ? w.id === "oura"
                      ? "Last synced 14m ago"
                      : w.id === "apple"
                      ? "Sync enabled for Sleep & Steps"
                      : "Not connected"
                    : w.detail}
                </p>
              </div>

              {isConnected ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-[#45e0d4]/30 bg-[#45e0d4]/10 px-2.5 py-1 text-xs font-medium text-[#45e0d4]">
                    Synced
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDisconnect(w.id)}
                    className="text-xs text-[#7d89a6] hover:text-[#ff8a8a] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnect(w.id, w.connectUrl)}
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

            {isExpanded && !isConnected && (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0d1833]/80 p-4 space-y-3">
                <p className="text-sm font-medium text-[#edf2ff]">
                  Connect {w.name}
                </p>
                <p className="text-xs leading-relaxed text-[#98a4bf]">
                  {w.id === "oura" && (
                    <>
                      Requires an Oura account with a paired ring. Visit{" "}
                      <a href="https://cloud.ouraring.com" target="_blank" rel="noopener noreferrer" className="text-[#45e0d4] underline underline-offset-2">
                        cloud.ouraring.com
                      </a>{" "}
                      to sign up.
                    </>
                  )}
                  {w.id === "whoop" && (
                    <>
                      Requires a Whoop membership. Visit{" "}
                      <a href="https://app.whoop.com" target="_blank" rel="noopener noreferrer" className="text-[#45e0d4] underline underline-offset-2">
                        app.whoop.com
                      </a>{" "}
                      to sign up.
                    </>
                  )}
                  {w.id === "apple" && (
                    <>
                      Apple Health uses HealthKit — open this app on your iPhone and grant access to Sleep and Steps data from the Health app.
                    </>
                  )}
                </p>
                <div className="flex gap-2">
                  {w.connectUrl && (
                    <a
                      href={w.connectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#45e0d4]/30 bg-[#0c1f3d] px-4 py-2 text-sm font-medium text-[#45e0d4] hover:bg-[#0c2a3d] transition-all"
                    >
                      Get {w.name}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSimulateConnect(w.id)}
                    className="rounded-xl border border-white/[0.08] bg-[#141f42] px-4 py-2 text-sm text-[#98a4bf] hover:text-[#edf2ff] transition-colors"
                  >
                    I have an account →
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!anyConnected && (
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
