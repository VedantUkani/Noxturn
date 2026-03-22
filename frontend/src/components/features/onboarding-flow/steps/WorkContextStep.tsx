"use client";

import type { OnboardingDraft } from "../types";
import type { TransportMode } from "@/lib/user-profile-settings";
import { CommuteEditor } from "@/components/features/settings-page/edit-profile/CommuteEditor";

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  errors?: { commuteMinutes?: string };
};

export function WorkContextStep({ draft, onChange, errors }: Props) {
  return (
    <div className="rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5 sm:p-6">
      <CommuteEditor
        minutes={draft.commuteMinutes}
        transportMode={draft.transportMode}
        onMinutesChange={(commuteMinutes) => onChange({ commuteMinutes })}
        onTransportChange={(transportMode: TransportMode) => onChange({ transportMode })}
        error={errors?.commuteMinutes}
      />
    </div>
  );
}
