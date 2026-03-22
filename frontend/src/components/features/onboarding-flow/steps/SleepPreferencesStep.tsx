"use client";

import type { OnboardingDraft, SleepConstraint } from "../types";
import type { ChronotypePreference, CaffeineHabit } from "@/lib/user-profile-settings";
import { SleepWindowEditor } from "@/components/features/settings-page/edit-profile/SleepWindowEditor";

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  errors?: {
    preferredSleepHours?: string;
    anchorSleepStart?: string;
    anchorSleepEnd?: string;
  };
};

export function SleepPreferencesStep({ draft, onChange, errors }: Props) {
  return (
    <div className="rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5 sm:p-6">
      <SleepWindowEditor
        chronotype={draft.chronotype}
        preferredSleepHours={draft.preferredSleepHours}
        anchorSleepStart={draft.anchorSleepStart}
        anchorSleepEnd={draft.anchorSleepEnd}
        anchorNote={draft.anchorNote}
        sleepConstraint={draft.sleepConstraint}
        caffeineHabit={draft.caffeineHabit}
        onChronotype={(chronotype: ChronotypePreference) => onChange({ chronotype })}
        onPreferredSleepHours={(preferredSleepHours: number) => onChange({ preferredSleepHours })}
        onAnchorStart={(anchorSleepStart: string) => onChange({ anchorSleepStart })}
        onAnchorEnd={(anchorSleepEnd: string) => onChange({ anchorSleepEnd })}
        onAnchorNote={(anchorNote: string) => onChange({ anchorNote })}
        onSleepConstraint={(sleepConstraint: SleepConstraint) => onChange({ sleepConstraint })}
        onCaffeineHabit={(caffeineHabit: CaffeineHabit) => onChange({ caffeineHabit })}
        errors={errors ?? {}}
      />
    </div>
  );
}
