"use client";

import { ONBOARDING_STEP_LABELS, type OnboardingStepIndex } from "./types";
import { cn } from "@/lib/utils";

type OnboardingStepperProps = {
  currentStep: OnboardingStepIndex;
};

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <nav aria-label="Onboarding progress" className="mb-8 w-full">
      <ol className="mx-auto flex max-w-3xl items-center justify-center gap-x-1 sm:gap-x-2">
        {ONBOARDING_STEP_LABELS.map((label, i) => {
          const n = (i + 1) as OnboardingStepIndex;
          const done = currentStep > n;
          const active = currentStep === n;
          return (
            <li key={label} className="flex items-center gap-1 sm:gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors",
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
                  "text-[11px] font-semibold whitespace-nowrap",
                  active ? "text-[#edf2ff]" : "text-[#7d89a6]",
                )}
              >
                {label}
              </span>
              {i < ONBOARDING_STEP_LABELS.length - 1 ? (
                <span
                  className="ml-0.5 inline-block h-px w-4 shrink-0 bg-white/[0.1] sm:w-6"
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
