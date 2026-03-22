"use client";

import { useId } from "react";
import type { OnboardingDraft, RoleId } from "../types";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const ROLES: { id: RoleId; title: string; description: string }[] = [
  { id: "nurse", title: "Nurse / RN", description: "Ward, ICU, or emergency rotations" },
  { id: "resident", title: "Medical Resident", description: "Graduate medical training schedules" },
  { id: "paramedic", title: "Paramedic / EMT", description: "Extended duty and turnaround shifts" },
  { id: "factory_worker", title: "Factory / Shift Worker", description: "Rotating or fixed industrial shifts" },
  { id: "other", title: "Other", description: "Another role with rotating hours" },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  errors?: { fullName?: string; roleId?: string };
};

export function IdentityStep({ draft, onChange, errors }: Props) {
  const id = useId();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={nx.labelUpper}>Full name</label>
          <input
            id={`${id}-name`}
            autoComplete="name"
            value={draft.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Alex Johnson"
            className={cn(
              "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
              errors?.fullName && "border-[#ff8a8a]/45",
            )}
          />
          {errors?.fullName && (
            <p className="mt-1.5 text-xs text-[#ff8a8a]">{errors.fullName}</p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={nx.labelUpper}>Email</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@hospital.org"
            className={cn(
              "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
            )}
          />
        </div>
      </div>

      <div>
        <p className={nx.labelUpper}>Clinical / worker role</p>
        {errors?.roleId && (
          <p className="mt-1 text-xs text-[#ff8a8a]">{errors.roleId}</p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Professional role">
          {ROLES.map((role) => {
            const selected = draft.roleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ roleId: role.id })}
                className={cn(
                  "rounded-2xl border px-4 py-3.5 text-left transition-all duration-150",
                  selected
                    ? "border-[#45e0d4] bg-[#0c2a3d] shadow-[0_0_0_1px_rgba(69,224,212,0.5),inset_0_0_20px_rgba(69,224,212,0.06)]"
                    : "border-white/[0.08] bg-[#0f1b3a]/80 hover:border-[#45e0d4]/40 hover:bg-[#0d1f35]",
                  nx.focusRing,
                )}
              >
                <span className={cn("block text-sm font-semibold transition-colors", selected ? "text-[#45e0d4]" : "text-[#edf2ff]")}>
                  {role.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-specialty`} className={nx.labelUpper}>
          Department / specialty
          <span className="ml-1 text-[#5c6a85] normal-case font-normal">(optional)</span>
        </label>
        <input
          id={`${id}-specialty`}
          value={draft.roleSpecialty}
          onChange={(e) => onChange({ roleSpecialty: e.target.value })}
          placeholder="e.g. ICU nights, Internal Medicine, Assembly line A…"
          className={cn(
            "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
            "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
          )}
        />
      </div>
    </div>
  );
}
