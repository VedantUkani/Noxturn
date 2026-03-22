"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { OnboardingNavigation } from "./OnboardingNavigation";
import { OnboardingStepHeader } from "./OnboardingStepHeader";
import { OnboardingStepper } from "./OnboardingStepper";
import { OnboardingSummaryStrip } from "./OnboardingSummaryStrip";
import { CommuteStep } from "./steps/CommuteStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { RoleSelectionStep } from "./steps/RoleSelectionStep";
import { ScheduleStep } from "./steps/ScheduleStep";
import {
  canFinishSchedule,
  useOnboardingWizard,
  validateStep,
} from "./use-onboarding-wizard";
import {
  POST_ONBOARDING_DEST_KEY,
  markOnboardingComplete,
} from "@/lib/onboarding-flag";
import { clearWizardState } from "./onboarding-persist";
import type { OnboardingStepIndex } from "./types";

const STEP_META: Record<
  OnboardingStepIndex,
  { title: string; description: string }
> = {
  1: {
    title: "What’s your role?",
    description:
      "We use this to tune language, priorities, and recovery framing in your plan.",
  },
  2: {
    title: "How long is your commute?",
    description:
      "Used to calculate available rest time between shifts — same idea as the original onboarding flow.",
  },
  3: {
    title: "Sleep preferences",
    description:
      "Sleep constraints that shape recovery timing in your plan.",
  },
  4: {
    title: "Bring in your rota",
    description:
      "Use the same calendar, file, and manual tools as Roster & schedule — or skip and finish.",
  },
};

export function OnboardingWizard() {
  const router = useRouter();
  const { step, draft, patchDraft, goNext, goBack } = useOnboardingWizard();

  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const meta = STEP_META[step];

  const onContinue = useCallback(() => {
    setError(null);
    if (!validateStep(step, draft)) {
      if (step === 1) {
        setError("Choose the role that best describes your work.");
      } else if (step === 2) {
        setError("Commute must be between 0 and 120 minutes.");
      }
      return;
    }
    if (step === 3) {
      patchDraft({ importComplete: null });
    }
    goNext();
  }, [step, draft, goNext, patchDraft]);

  const onFinish = useCallback(() => {
    setError(null);
    if (!canFinishSchedule(draft)) {
      setError(
        "Add at least one shift (import or +), or check “I’ll set up my schedule in the app next.”",
      );
      return;
    }
    setFinishing(true);

    // Save onboarding profile to localStorage so dashboard can read it
    try {
      localStorage.setItem(
        "noxturn_profile",
        JSON.stringify({
          roleId: draft.roleId,
          commuteMinutes: draft.commuteMinutes,
          sleepConstraint: draft.sleepConstraint,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch { /* ignore */ }

    markOnboardingComplete();
    clearWizardState();

    let dest = "/today";
    try {
      const s = sessionStorage.getItem(POST_ONBOARDING_DEST_KEY);
      if (s && s.startsWith("/") && !s.startsWith("//")) dest = s;
    } catch {
      /* ignore */
    }
    router.push(dest);
    router.refresh();
  }, [draft, router]);

  const handleBack = useCallback(() => {
    setError(null);
    if (step === 4) {
      patchDraft({ importComplete: null });
    }
    goBack();
  }, [step, goBack, patchDraft]);

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <OnboardingStepper currentStep={step} />
      <OnboardingSummaryStrip step={step} draft={draft} />
      <OnboardingStepHeader title={meta.title} description={meta.description} />

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200/95"
        >
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <RoleSelectionStep
          draft={draft}
          onChange={(roleId) => patchDraft({ roleId })}
        />
      ) : null}
      {step === 2 ? (
        <CommuteStep draft={draft} onChange={patchDraft} />
      ) : null}
      {step === 3 ? (
        <PreferencesStep draft={draft} onChange={patchDraft} />
      ) : null}
      {step === 4 ? (
        <ScheduleStep draft={draft} onChange={patchDraft} />
      ) : null}

      <OnboardingNavigation
        showBack={step > 1}
        onBack={handleBack}
        primaryLabel={step === 4 ? "Finish setup" : "Continue"}
        onPrimary={step === 4 ? onFinish : onContinue}
        pending={finishing}
      />
    </div>
  );
}
