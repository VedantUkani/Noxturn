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
                "rounded-2xl border px-4 py-3.5 text-left transition-all duration-150",
                selected
                  ? "border-[#45e0d4] bg-[#0c2a3d] shadow-[0_0_0_1px_rgba(69,224,212,0.5),inset_0_0_20px_rgba(69,224,212,0.06)]"
                  : "border-white/[0.08] bg-[#0f1b3a]/80 hover:border-[#45e0d4]/40 hover:bg-[#0d1f35]",
                disabled && "pointer-events-none opacity-50",
                nx.focusRing,
              )}
            >
              <span className={cn("block text-sm font-semibold transition-colors", selected ? "text-[#45e0d4]" : "text-[#edf2ff]")}>
                {opt.title}
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
