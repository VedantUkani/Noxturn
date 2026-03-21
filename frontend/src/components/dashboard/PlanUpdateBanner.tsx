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
          ? "border border-slate-600/45 bg-slate-900/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "border border-teal-400/35 bg-teal-400/[0.08] shadow-[0_0_40px_-16px_rgba(45,212,191,0.35),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={cn(
              "text-sm leading-relaxed",
              soft ? "text-slate-200/95" : "text-teal-50/95",
            )}
          >
            {message}
          </p>
          {why ? (
            <p
              className={cn(
                "text-xs leading-relaxed",
                soft ? "text-slate-400/95" : "text-teal-200/75",
              )}
            >
              {why}
            </p>
          ) : null}
          {scopeNote ? (
            <p
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.12em]",
                soft ? "text-slate-500" : "text-teal-400/55",
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
              ? "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 focus-visible:ring-slate-500/50"
              : "text-teal-200/80 hover:bg-teal-400/10 hover:text-teal-50 focus-visible:ring-teal-300/50",
          )}
          aria-label="Dismiss plan update"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
