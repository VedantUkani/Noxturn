"use client";

import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import type { OnboardingDraft } from "../types";

const SLEEP_CONDITIONS = [
  { id: "sleep_apnea", label: "Sleep apnea" },
  { id: "insomnia",    label: "Insomnia" },
  { id: "rls",         label: "Restless legs" },
  { id: "hypersomnia", label: "Hypersomnia" },
  { id: "none",        label: "None" },
  { id: "other",       label: "Other" },
];

const MEDICAL_HISTORY = [
  { id: "cardiovascular",     label: "Heart / cardiovascular" },
  { id: "diabetes",           label: "Diabetes / blood sugar" },
  { id: "anxiety_depression", label: "Anxiety / depression" },
  { id: "chronic_fatigue",    label: "Chronic fatigue" },
  { id: "hypertension",       label: "Hypertension" },
  { id: "none",               label: "None of the above" },
  { id: "other",              label: "Other" },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

const sectionCard = "rounded-2xl border border-white/[0.06] bg-[#0f1b3a]/70 p-4 sm:p-5 space-y-3";
const inputCls = cn(
  "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
  "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
);

/** Toggle a chip. "none" clears everything else; "other" co-exists with selections. */
function toggleItem(list: string[], id: string): string[] {
  if (id === "none") return list.includes("none") ? [] : ["none"];
  const withoutNone = list.filter((x) => x !== "none");
  return withoutNone.includes(id)
    ? withoutNone.filter((x) => x !== id)
    : [...withoutNone, id];
}

/** Pull the free-text portion stored as "other:<text>" */
function getOtherText(list: string[]): string {
  const entry = list.find((x) => x.startsWith("other:"));
  return entry ? entry.slice(6) : "";
}

/** Replace or add the "other:<text>" entry */
function setOtherText(list: string[], text: string): string[] {
  const without = list.filter((x) => !x.startsWith("other:") && x !== "other");
  return text.trim() ? [...without, `other:${text}`] : without;
}

function hasOther(list: string[]): boolean {
  return list.includes("other") || list.some((x) => x.startsWith("other:"));
}

export function HealthReportStep({ draft, onChange }: Props) {
  const toggleSleep = (id: string) => {
    if (id === "other") {
      const next = hasOther(draft.sleepConditions)
        ? draft.sleepConditions.filter((x) => x !== "other" && !x.startsWith("other:"))
        : [...draft.sleepConditions.filter((x) => x !== "none"), "other"];
      onChange({ sleepConditions: next });
    } else {
      onChange({ sleepConditions: toggleItem(draft.sleepConditions, id) });
    }
  };

  const toggleMedical = (id: string) => {
    if (id === "other") {
      const next = hasOther(draft.medicalHistory)
        ? draft.medicalHistory.filter((x) => x !== "other" && !x.startsWith("other:"))
        : [...draft.medicalHistory.filter((x) => x !== "none"), "other"];
      onChange({ medicalHistory: next });
    } else {
      onChange({ medicalHistory: toggleItem(draft.medicalHistory, id) });
    }
  };

  const sleepOtherOn = hasOther(draft.sleepConditions);
  const medicalOtherOn = hasOther(draft.medicalHistory);

  return (
    <div className="space-y-4">

      {/* Medications */}
      <div className={sectionCard}>
        <p className={nx.labelUpper}>Current medications</p>
        <p className="text-sm text-[#98a4bf]">Are you currently taking any medications?</p>
        <div className="flex gap-3">
          {([true, false] as const).map((val) => {
            const on = draft.onMedications === val;
            return (
              <button
                key={String(val)}
                type="button"
                onClick={() => onChange({ onMedications: val })}
                className={cn(
                  "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                  on
                    ? "border-[#45e0d4] bg-[#0c2a3d] text-[#45e0d4] shadow-[0_0_0_1px_rgba(69,224,212,0.3)]"
                    : "border-white/[0.08] bg-[#0d1833]/60 text-[#98a4bf] hover:border-white/[0.18] hover:text-[#edf2ff]",
                  nx.focusRing,
                )}
              >
                {val ? "Yes" : "No"}
              </button>
            );
          })}
        </div>
        {draft.onMedications === true && (
          <input
            type="text"
            value={draft.medicationDetails}
            onChange={(e) => onChange({ medicationDetails: e.target.value })}
            placeholder="e.g. Melatonin, Beta blockers… (optional)"
            className={inputCls}
          />
        )}
      </div>

      {/* Sleep conditions */}
      <div className={sectionCard}>
        <p className={nx.labelUpper}>Sleep conditions</p>
        <p className="text-sm text-[#98a4bf]">Any diagnosed or suspected conditions?</p>
        <div className="flex flex-wrap gap-2">
          {SLEEP_CONDITIONS.map((c) => {
            const on = c.id === "other"
              ? sleepOtherOn
              : draft.sleepConditions.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleSleep(c.id)}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all",
                  on
                    ? "border-[#45e0d4] bg-[#0c2a3d] text-[#45e0d4] shadow-[0_0_0_1px_rgba(69,224,212,0.25)]"
                    : "border-white/[0.08] bg-[#0d1833]/60 text-[#98a4bf] hover:border-white/[0.18] hover:text-[#edf2ff]",
                  nx.focusRing,
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {sleepOtherOn && (
          <input
            type="text"
            autoFocus
            value={getOtherText(draft.sleepConditions)}
            onChange={(e) =>
              onChange({ sleepConditions: setOtherText(draft.sleepConditions, e.target.value) })
            }
            placeholder="Describe your condition…"
            className={inputCls}
          />
        )}
      </div>

      {/* Medical history */}
      <div className={sectionCard}>
        <p className={nx.labelUpper}>Relevant medical history</p>
        <p className="text-sm text-[#98a4bf]">Select anything that applies.</p>
        <div className="flex flex-wrap gap-2">
          {MEDICAL_HISTORY.map((c) => {
            const on = c.id === "other"
              ? medicalOtherOn
              : draft.medicalHistory.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleMedical(c.id)}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all",
                  on
                    ? "border-[#45e0d4] bg-[#0c2a3d] text-[#45e0d4] shadow-[0_0_0_1px_rgba(69,224,212,0.25)]"
                    : "border-white/[0.08] bg-[#0d1833]/60 text-[#98a4bf] hover:border-white/[0.18] hover:text-[#edf2ff]",
                  nx.focusRing,
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {medicalOtherOn && (
          <input
            type="text"
            autoFocus
            value={getOtherText(draft.medicalHistory)}
            onChange={(e) =>
              onChange({ medicalHistory: setOtherText(draft.medicalHistory, e.target.value) })
            }
            placeholder="Describe your condition…"
            className={inputCls}
          />
        )}
      </div>

    </div>
  );
}
