"use client";

import type { RoleId } from "@/components/features/onboarding-flow/types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const OPTIONS: {
  id: RoleId;
  title: string;
  description: string;
}[] = [
  {
    id: "nurse",
    title: "Nurse / RN",
    description: "Ward, ICU, or emergency rotations",
  },
  {
    id: "resident",
    title: "Medical Resident",
    description: "Graduate medical training schedules",
  },
  {
    id: "paramedic",
    title: "Paramedic / EMT",
    description: "Extended duty and turnaround shifts",
  },
  {
    id: "factory_worker",
    title: "Factory / Shift Worker",
    description: "Rotating or fixed industrial shifts",
  },
  {
    id: "other",
    title: "Other",
    description: "Another role with rotating hours",
  },
];

type RoleSelectorProps = {
  value: RoleId;
  onChange: (id: RoleId) => void;
  error?: string;
  disabled?: boolean;
};

export function RoleSelector({
  value,
  onChange,
  error,
  disabled,
}: RoleSelectorProps) {
  return (
    <div>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="Professional role"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "role-error" : undefined}
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={cn(
                "rounded-2xl border px-4 py-3.5 text-left transition-colors",
                "border-white/[0.08] bg-[#0f1b3a]/80 hover:border-white/[0.12]",
                selected &&
                  "border-[#45e0d4]/40 bg-[#0c1f3d]/55 shadow-[inset_0_0_0_1px_rgba(69,224,212,0.15)]",
                disabled && "pointer-events-none opacity-50",
                nx.focusRing,
              )}
            >
              <span className="block text-sm font-semibold text-[#edf2ff]">
                {opt.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#7d89a6]">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p id="role-error" className="mt-2 text-sm text-[#ff8a8a]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
