"use client";

import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import { sleepHoursToSliderRatio } from "@/lib/user-profile-settings";
import type { ChronotypePreference, CaffeineHabit } from "@/lib/user-profile-settings";
import type { OnboardingDraft, SleepConstraint } from "../types";

const CHRONO: { id: ChronotypePreference; label: string; icon: string }[] = [
  { id: "early_bird", label: "Early bird", icon: "🌅" },
  { id: "neutral",    label: "Balanced",   icon: "⚖️" },
  { id: "night_owl",  label: "Night owl",  icon: "🌙" },
];

const CONSTRAINTS: { id: SleepConstraint; label: string }[] = [
  { id: "cant_sleep_before_9am", label: "Hard to sleep before 9 AM after nights" },
  { id: "light_sensitive",       label: "Light sensitive before sleep" },
  { id: "short_sleep_risk",      label: "Often short sleep after shifts" },
  { id: "none",                  label: "No specific constraint" },
];

const CAFFEINE: { id: CaffeineHabit; label: string }[] = [
  { id: "before_noon",    label: "Done before noon" },
  { id: "afternoon_ok",  label: "Afternoon is fine" },
  { id: "late_sensitive", label: "Sensitive late in the day" },
  { id: "minimal",        label: "Minimal overall" },
];

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  errors?: {
    preferredSleepHours?: string;
    anchorSleepStart?: string;
    anchorSleepEnd?: string;
  };
};

const sectionCard = "rounded-2xl border border-white/[0.06] bg-[#0f1b3a]/70 p-4 sm:p-5 space-y-4";
const selectCls = cn(
  "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
  "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
);
const timeCls = cn(
  "w-full rounded-xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
  "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
);

export function SleepPreferencesStep({ draft, onChange, errors }: Props) {
  const fillPct = sleepHoursToSliderRatio(draft.preferredSleepHours) * 100;

  return (
    <div className="space-y-4">

      {/* Chronotype */}
      <div className={sectionCard}>
        <p className={nx.labelUpper}>Chronotype</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Chronotype">
          {CHRONO.map((opt) => {
            const on = draft.chronotype === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange({ chronotype: opt.id })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-medium transition-all",
                  on
                    ? "border-[#45e0d4] bg-[#0c2a3d] text-[#45e0d4] shadow-[0_0_0_1px_rgba(69,224,212,0.3)]"
                    : "border-white/[0.08] bg-[#0d1833]/60 text-[#98a4bf] hover:border-white/[0.18] hover:text-[#edf2ff]",
                  nx.focusRing,
                )}
              >
                <span className="text-lg leading-none">{opt.icon}</span>
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sleep duration */}
      <div className={sectionCard}>
        <div className="flex items-center justify-between">
          <p className={nx.labelUpper}>Sleep duration</p>
          <span className="text-lg font-bold tabular-nums text-[#f4c22b]">
            {draft.preferredSleepHours} h
          </span>
        </div>
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[#45e0d4]/20"
            style={{ width: `${fillPct}%` }}
            aria-hidden
          />
          <input
            type="range"
            min={5}
            max={12}
            step={0.25}
            value={draft.preferredSleepHours}
            onChange={(e) => onChange({ preferredSleepHours: parseFloat(e.target.value) })}
            className="relative z-[1] h-2 w-full cursor-pointer accent-[#f4c22b]"
          />
        </div>
        <div className="flex justify-between text-xs text-[#5c6a85]">
          <span>5 h</span>
          <span>12 h</span>
        </div>
        {errors?.preferredSleepHours && (
          <p className="text-xs text-[#ff8a8a]">{errors.preferredSleepHours}</p>
        )}
      </div>

      {/* Anchor window */}
      <div className={sectionCard}>
        <p className={nx.labelUpper}>Anchor sleep window</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-[#7d89a6]">Start</label>
            <input
              type="time"
              value={draft.anchorSleepStart}
              onChange={(e) => onChange({ anchorSleepStart: e.target.value })}
              className={cn(timeCls, errors?.anchorSleepStart && "border-[#ff8a8a]/50")}
            />
            {errors?.anchorSleepStart && (
              <p className="mt-1 text-xs text-[#ff8a8a]">{errors.anchorSleepStart}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[#7d89a6]">End</label>
            <input
              type="time"
              value={draft.anchorSleepEnd}
              onChange={(e) => onChange({ anchorSleepEnd: e.target.value })}
              className={cn(timeCls, errors?.anchorSleepEnd && "border-[#ff8a8a]/50")}
            />
            {errors?.anchorSleepEnd && (
              <p className="mt-1 text-xs text-[#ff8a8a]">{errors.anchorSleepEnd}</p>
            )}
          </div>
        </div>
      </div>

      {/* Constraint + Caffeine */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={sectionCard}>
          <p className={nx.labelUpper}>Sleep constraint</p>
          <select
            value={draft.sleepConstraint}
            onChange={(e) => onChange({ sleepConstraint: e.target.value as SleepConstraint })}
            className={selectCls}
          >
            {CONSTRAINTS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className={sectionCard}>
          <p className={nx.labelUpper}>Caffeine pattern</p>
          <select
            value={draft.caffeineHabit}
            onChange={(e) => onChange({ caffeineHabit: e.target.value as CaffeineHabit })}
            className={selectCls}
          >
            {CAFFEINE.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}
