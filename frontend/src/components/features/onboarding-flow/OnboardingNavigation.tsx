"use client";

import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

type OnboardingNavigationProps = {
  showBack: boolean;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  pending?: boolean;
};

export function OnboardingNavigation({
  showBack,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  pending,
}: OnboardingNavigationProps) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#98a4bf] transition-colors",
              "hover:bg-white/[0.04] hover:text-[#edf2ff]",
              "disabled:pointer-events-none disabled:opacity-50",
              nx.focusRing,
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        ) : (
          <span className="hidden sm:inline-block" aria-hidden />
        )}
      </div>
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled || pending}
        className={cn(
          nx.primaryButton,
          "inline-flex min-h-11 min-w-[8.5rem] items-center justify-center px-6 py-2.5 text-sm",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" aria-hidden />
            {primaryLabel}
          </span>
        ) : primaryLabel}
      </button>
    </div>
  );
}
