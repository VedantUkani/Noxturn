"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { OnboardingNavigation } from "./OnboardingNavigation";
import { OnboardingStepHeader } from "./OnboardingStepHeader";
import { OnboardingStepper } from "./OnboardingStepper";
import { IdentityStep } from "./steps/IdentityStep";
import { WorkContextStep } from "./steps/WorkContextStep";
import { SleepPreferencesStep } from "./steps/SleepPreferencesStep";
import { WearablesStep } from "./steps/WearablesStep";
import { HealthReportStep } from "./steps/HealthReportStep";
import { canFinish, useOnboardingWizard, validateStep } from "./use-onboarding-wizard";
import {
  POST_ONBOARDING_DEST_KEY,
  markOnboardingComplete,
} from "@/lib/onboarding-flag";
import { clearWizardState } from "./onboarding-persist";
import {
  saveUserProfileSettings,
  type UserProfileSettings,
} from "@/lib/user-profile-settings";
import type { OnboardingStepIndex } from "./types";

const STEP_META: Record<OnboardingStepIndex, { title: string; description: string }> = {
  1: {
    title: "Who are you?",
    description: "Your identity and role shape how Noxturn frames your recovery plan.",
  },
  2: {
    title: "Commute & work context",
    description: "Travel time is factored into rest buffers between your shifts.",
  },
  3: {
    title: "Sleep preferences",
    description: "Tell us how you sleep so we can tune your circadian recovery windows.",
  },
  4: {
    title: "Connect a wearable",
    description: "Oura Ring data lets Noxturn adapt your plan to how you actually slept.",
  },
  5: {
    title: "Health report",
    description: "Upload any medical clearance or sleep study. Completely optional.",
  },
};

type StepErrors = {
  fullName?: string;
  roleId?: string;
  commuteMinutes?: string;
};

export function OnboardingWizard() {
  const router = useRouter();
  const { step, draft, patchDraft, goNext, goBack } = useOnboardingWizard();

  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [finishing, setFinishing] = useState(false);

  const meta = STEP_META[step];

  const onContinue = useCallback(() => {
    setError(null);
    setStepErrors({});

    if (!validateStep(step, draft)) {
      if (step === 1) {
        const errs: StepErrors = {};
        if (!draft.fullName.trim()) errs.fullName = "Full name is required.";
        if (!draft.roleId) errs.roleId = "Please select your role.";
        setStepErrors(errs);
        setError("Fill in the required fields above.");
      } else if (step === 2) {
        setStepErrors({ commuteMinutes: "Must be between 0 and 120 minutes." });
        setError("Check the highlighted field.");
      }
      return;
    }
    goNext();
  }, [step, draft, goNext]);

  const onFinish = useCallback(() => {
    setError(null);
    if (!canFinish(draft)) return;
    setFinishing(true);

    try {
      const profile: UserProfileSettings = {
        fullName: draft.fullName,
        email: draft.email,
        roleId: draft.roleId ?? "other",
        roleSpecialty: draft.roleSpecialty,
        commuteMinutes: draft.commuteMinutes,
        transportMode: draft.transportMode,
        chronotype: draft.chronotype,
        preferredSleepHours: draft.preferredSleepHours,
        anchorSleepStart: draft.anchorSleepStart,
        anchorSleepEnd: draft.anchorSleepEnd,
        anchorNote: draft.anchorNote,
        sleepConstraint: draft.sleepConstraint,
        caffeineHabit: draft.caffeineHabit,
        fitbitConnected: draft.fitbitConnected,
        onMedications: draft.onMedications,
        medicationDetails: draft.medicationDetails,
        sleepConditions: draft.sleepConditions,
        medicalHistory: draft.medicalHistory,
      };
      saveUserProfileSettings(profile);
    } catch {
      /* ignore storage errors */
    }

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
    setStepErrors({});
    goBack();
  }, [goBack]);

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <OnboardingStepper currentStep={step} />
      <OnboardingStepHeader title={meta.title} description={meta.description} />

      {error ? (
        <p
          role="alert"
          className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200/95"
        >
          {error}
        </p>
      ) : null}

      {step === 1 && (
        <IdentityStep draft={draft} onChange={patchDraft} errors={stepErrors} />
      )}
      {step === 2 && (
        <WorkContextStep draft={draft} onChange={patchDraft} errors={stepErrors} />
      )}
      {step === 3 && (
        <SleepPreferencesStep draft={draft} onChange={patchDraft} />
      )}
      {step === 4 && (
        <WearablesStep draft={draft} onChange={patchDraft} />
      )}
      {step === 5 && (
        <HealthReportStep draft={draft} onChange={patchDraft} />
      )}

      <OnboardingNavigation
        showBack={step > 1}
        onBack={handleBack}
        primaryLabel={step === 5 ? "Finish setup" : "Continue"}
        onPrimary={step === 5 ? onFinish : onContinue}
        pending={finishing}
      />
    </div>
  );
}
