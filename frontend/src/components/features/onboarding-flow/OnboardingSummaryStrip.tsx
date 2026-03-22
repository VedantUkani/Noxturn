"use client";

import type { OnboardingDraft, RoleId, SleepConstraint } from "./types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

function roleLabel(id: RoleId | null): string {
  if (!id) return "—";
  const m: Record<RoleId, string> = {
    nurse: "Nurse / RN",
    paramedic: "Paramedic / EMT",
    factory_worker: "Factory / Shift Worker",
    resident: "Medical Resident",
    other: "Other",
  };
  return m[id];
}

const CONSTRAINT_LABELS: Record<SleepConstraint, string> = {
  cant_sleep_before_9am: "Can't sleep before 9 AM after nights",
  light_sensitive: "Light sensitive before sleep",
  short_sleep_risk: "Frequently short sleep after shifts",
  none: "No specific constraint",
};

function constraintLabel(c: SleepConstraint): string {
  return CONSTRAINT_LABELS[c];
}

type OnboardingSummaryStripProps = {
  step: number;
  draft: OnboardingDraft;
};

export function OnboardingSummaryStrip({
  step,
  draft,
}: OnboardingSummaryStripProps) {
  if (step <= 1) return null;

  return (
    <div
      className={cn(
        nx.card,
        "mb-8 flex flex-wrap gap-x-6 gap-y-2 border-white/[0.05] bg-[#141f42]/70 px-4 py-3 text-xs text-[#7d89a6]",
      )}
    >
      <span>
        Role:{" "}
        <span className="font-medium text-[#edf2ff]">{roleLabel(draft.roleId)}</span>
      </span>
      {step >= 3 ? (
        <span>
          Commute:{" "}
          <span className="font-medium text-[#edf2ff]">
            {draft.commuteMinutes} min
          </span>
        </span>
      ) : null}
      {step >= 4 ? (
        <span>
          Constraint:{" "}
          <span className="font-medium text-[#edf2ff]">
            {constraintLabel(draft.sleepConstraint)}
          </span>
        </span>
      ) : null}
    </div>
  );
}
