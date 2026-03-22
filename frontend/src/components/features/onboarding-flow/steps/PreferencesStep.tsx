"use client";

import type { OnboardingDraft, SleepConstraint } from "../types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const CONSTRAINTS: { id: SleepConstraint; label: string }[] = [
  {
    id: "cant_sleep_before_9am",
    label: "Can't sleep before 9 AM after nights",
  },
  { id: "light_sensitive", label: "Light sensitive before sleep" },
  { id: "short_sleep_risk", label: "Frequently short sleep after shifts" },
  { id: "none", label: "No specific constraint" },
];

type PreferencesStepProps = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function PreferencesStep({ draft, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className={cn(nx.card, "p-6")}>
        <label htmlFor="sleep-constraint" className={nx.labelUpper}>
          Sleep constraint
        </label>
        <p className="mt-2 text-sm text-[#98a4bf]">
          Helps personalise sleep timing in your recovery plan.
        </p>
        <select
          id="sleep-constraint"
          value={draft.sleepConstraint}
          onChange={(e) =>
            onChange({ sleepConstraint: e.target.value as SleepConstraint })
          }
          className={cn(
            "mt-4 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
            "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
          )}
        >
          {CONSTRAINTS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
