"use client";

import { ONBOARDING_STEP_LABELS, type OnboardingStepIndex } from "./types";
import { cn } from "@/lib/utils";

type OnboardingStepperProps = {
  currentStep: OnboardingStepIndex;
};

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <nav aria-label="Onboarding progress" className="mb-10 w-full">
      <ol className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-6 md:gap-x-8">
        {ONBOARDING_STEP_LABELS.map((label, i) => {
          const n = (i + 1) as OnboardingStepIndex;
          const done = currentStep > n;
          const active = currentStep === n;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
                  done && "bg-[#45e0d4] text-[#04112d]",
                  active &&
                    !done &&
                    "bg-[#0c1f3d] text-[#45e0d4] shadow-[inset_0_0_0_2px_rgba(69,224,212,0.35)]",
                  !done &&
                    !active &&
                    "border border-white/[0.1] bg-[#101c3c]/80 text-[#7d89a6]",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold sm:text-sm",
                  active ? "text-[#edf2ff]" : "text-[#7d89a6]",
                )}
              >
                {label}
              </span>
              {i < ONBOARDING_STEP_LABELS.length - 1 ? (
                <span
                  className="ml-1 hidden h-px w-6 bg-white/[0.1] sm:ml-2 sm:inline-block md:w-10"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
