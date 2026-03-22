"use client";

import type { OnboardingDraft, RoleId } from "../types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const OPTIONS: {
  id: RoleId;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    id: "nurse",
    emoji: "🏥",
    title: "Nurse / RN",
    description: "ICU, ER, or ward rotations",
  },
  {
    id: "paramedic",
    emoji: "🚑",
    title: "Paramedic / EMT",
    description: "24-on / 48-off schedules",
  },
  {
    id: "factory_worker",
    emoji: "🏭",
    title: "Factory / Shift Worker",
    description: "Rotating 8h or 12h shifts",
  },
  {
    id: "resident",
    emoji: "⚕️",
    title: "Medical Resident",
    description: "Long call rotations",
  },
  {
    id: "other",
    emoji: "👤",
    title: "Other",
    description: "Any rotating schedule",
  },
];

type RoleSelectionStepProps = {
  draft: OnboardingDraft;
  onChange: (roleId: RoleId) => void;
};

export function RoleSelectionStep({ draft, onChange }: RoleSelectionStepProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      role="radiogroup"
      aria-label="Your role"
    >
      {OPTIONS.map((opt) => {
        const selected = draft.roleId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={cn(
              nx.card,
              "flex w-full items-start gap-3 p-5 text-left transition-[box-shadow,transform] duration-150",
              "hover:border-white/[0.1]",
              selected &&
                "border-[#45e0d4]/35 bg-[#0c1f3d]/50 shadow-[inset_0_0_0_1px_rgba(69,224,212,0.2)]",
              nx.focusRing,
            )}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {opt.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-[#edf2ff]">
                {opt.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#7d89a6]">
                {opt.description}
              </span>
            </span>
            {selected ? (
              <span
                className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#45e0d4]"
                aria-hidden
              >
                <svg
                  className="h-3 w-3 text-[#04112d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
