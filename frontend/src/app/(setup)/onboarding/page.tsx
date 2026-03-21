import { Suspense } from "react";
import { OnboardingPageContent } from "@/components/features/onboarding/OnboardingPageContent";

function OnboardingFallback() {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-3 text-center">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400/20 border-t-teal-400"
        aria-hidden
      />
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingPageContent />
    </Suspense>
  );
}
