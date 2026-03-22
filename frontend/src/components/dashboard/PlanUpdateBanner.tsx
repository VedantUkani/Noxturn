"use client";

import { IconClose } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

type PlanUpdateBannerProps = {
  message: string;
  /** Why the plan shifted — calm, explanatory. */
  why?: string;
  /** Horizon hint (e.g. next 12–24 hours only). */
  scopeNote?: string;
  /** Strong = anchor-scale replan; soft = lighter nudge. */
  tone?: "strong" | "soft";
  onDismiss: () => void;
  className?: string;
};

export function PlanUpdateBanner({
  message,
  why,
  scopeNote,
  tone = "strong",
  onDismiss,
  className,
}: PlanUpdateBannerProps) {
  const soft = tone === "soft";
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-2 rounded-2xl px-4 py-3",
        soft
          ? "border border-white/[0.08] bg-[#141f42]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "border border-[#45e0d4]/35 bg-[#45e0d4]/[0.08] shadow-[0_0_40px_-16px_rgba(69,224,212,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={cn(
              "text-sm leading-relaxed",
              soft ? "text-[#edf2ff]/95" : "text-[#edf2ff]/95",
            )}
          >
            {message}
          </p>
          {why ? (
            <p
              className={cn(
                "text-xs leading-relaxed",
                soft ? "text-[#98a4bf]/95" : "text-[#86c9ff]/85",
              )}
            >
              {why}
            </p>
          ) : null}
          {scopeNote ? (
            <p
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.12em]",
                soft ? "text-[#7d89a6]" : "text-[#45e0d4]/55",
              )}
            >
              {scopeNote}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "shrink-0 self-start rounded-lg p-1.5 transition-colors focus-visible:outline focus-visible:ring-2",
            soft
              ? "text-[#98a4bf] hover:bg-white/[0.06] hover:text-[#edf2ff] focus-visible:ring-[#45e0d4]/40"
              : "text-[#86c9ff] hover:bg-[#45e0d4]/10 hover:text-[#edf2ff] focus-visible:ring-[#45e0d4]/45",
          )}
          aria-label="Dismiss plan update"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
