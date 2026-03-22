"use client";

import type { SleepConstraint } from "@/components/features/onboarding-flow/types";
import type { ChronotypePreference, CaffeineHabit } from "@/lib/user-profile-settings";
import { sleepHoursToSliderRatio } from "@/lib/user-profile-settings";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

const CHRONO_OPTIONS: {
  id: ChronotypePreference;
  label: string;
  hint: string;
}[] = [
  {
    id: "early_bird",
    label: "Early bird",
    hint: "Wind-down earlier",
  },
  {
    id: "neutral",
    label: "Balanced",
    hint: "Flexible peak",
  },
  {
    id: "night_owl",
    label: "Night owl",
    hint: "Late peak bias",
  },
];

const CONSTRAINTS: { id: SleepConstraint; label: string }[] = [
  {
    id: "cant_sleep_before_9am",
    label: "Hard to sleep before 9 AM after nights",
  },
  { id: "light_sensitive", label: "Light sensitive before sleep" },
  { id: "short_sleep_risk", label: "Often short sleep after shifts" },
  { id: "none", label: "No specific constraint" },
];

const CAFFEINE: { id: CaffeineHabit; label: string }[] = [
  { id: "before_noon", label: "Usually finish caffeine before noon" },
  { id: "afternoon_ok", label: "Afternoon caffeine is usually fine" },
  { id: "late_sensitive", label: "Sensitive to caffeine late in the day" },
  { id: "minimal", label: "Minimal caffeine overall" },
];

type SleepWindowEditorProps = {
  chronotype: ChronotypePreference;
  preferredSleepHours: number;
  anchorSleepStart: string;
  anchorSleepEnd: string;
  anchorNote: string;
  sleepConstraint: SleepConstraint;
  caffeineHabit: CaffeineHabit;
  onChronotype: (v: ChronotypePreference) => void;
  onPreferredSleepHours: (v: number) => void;
  onAnchorStart: (v: string) => void;
  onAnchorEnd: (v: string) => void;
  onAnchorNote: (v: string) => void;
  onSleepConstraint: (v: SleepConstraint) => void;
  onCaffeineHabit: (v: CaffeineHabit) => void;
  errors: Partial<
    Record<
      "preferredSleepHours" | "anchorSleepStart" | "anchorSleepEnd",
      string
    >
  >;
  disabled?: boolean;
};

export function SleepWindowEditor({
  chronotype,
  preferredSleepHours,
  anchorSleepStart,
  anchorSleepEnd,
  anchorNote,
  sleepConstraint,
  caffeineHabit,
  onChronotype,
  onPreferredSleepHours,
  onAnchorStart,
  onAnchorEnd,
  onAnchorNote,
  onSleepConstraint,
  onCaffeineHabit,
  errors,
  disabled,
}: SleepWindowEditorProps) {
  const fillPct = sleepHoursToSliderRatio(preferredSleepHours) * 100;

  return (
    <div className="space-y-8">
      <div>
        <p className={nx.labelUpper}>Chronotype</p>
        <p className="mt-1.5 text-sm text-[#98a4bf]">
          How your sleep drive lines up when you are off a rigid schedule.
        </p>
        <div
          className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Chronotype preference"
        >
          {CHRONO_OPTIONS.map((opt) => {
            const on = chronotype === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={disabled}
                onClick={() => onChronotype(opt.id)}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-left text-sm transition-colors",
                  "border-white/[0.08] bg-[#0f1b3a]/80",
                  on &&
                    "border-[#45e0d4]/40 bg-[#0c1f3d]/55 shadow-[inset_0_0_0_1px_rgba(69,224,212,0.12)]",
                  disabled && "pointer-events-none opacity-50",
                  nx.focusRing,
                )}
              >
                <span className="font-semibold text-[#edf2ff]">{opt.label}</span>
                <span className="mt-1 block text-xs text-[#7d89a6]">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label htmlFor="sleep-hours-slider" className={nx.labelUpper}>
            Preferred sleep duration
          </label>
          <span className="text-lg font-semibold tabular-nums text-[#f4c22b]">
            {preferredSleepHours} h
          </span>
        </div>
        <p className="mt-1 text-sm text-[#98a4bf]">
          Typical night you are aiming for — not a shift roster.
        </p>
        <div className="relative mt-4">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-[#45e0d4]/25"
            style={{ width: `${fillPct}%` }}
            aria-hidden
          />
          <input
            id="sleep-hours-slider"
            type="range"
            min={5}
            max={12}
            step={0.25}
            disabled={disabled}
            value={preferredSleepHours}
            onChange={(e) =>
              onPreferredSleepHours(Number.parseFloat(e.target.value))
            }
            className="relative z-[1] h-2 w-full cursor-pointer accent-[#f4c22b]"
            aria-valuemin={5}
            aria-valuemax={12}
            aria-valuenow={preferredSleepHours}
            aria-invalid={errors.preferredSleepHours ? true : undefined}
            aria-describedby={
              errors.preferredSleepHours ? "sleep-hours-err" : undefined
            }
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-[#7d89a6]">
          <span>5 h</span>
          <span>12 h</span>
        </div>
        {errors.preferredSleepHours ? (
          <p
            id="sleep-hours-err"
            className="mt-2 text-sm text-[#ff8a8a]"
            role="alert"
          >
            {errors.preferredSleepHours}
          </p>
        ) : null}
      </div>

      <div>
        <p className={nx.labelUpper}>Anchor sleep window</p>
        <p className="mt-1.5 text-sm text-[#98a4bf]">
          Recurring window you protect for core sleep — especially across changing
          shifts.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="anchor-start"
              className="text-xs font-medium text-[#7d89a6]"
            >
              Start
            </label>
            <input
              id="anchor-start"
              type="time"
              disabled={disabled}
              value={anchorSleepStart}
              onChange={(e) => onAnchorStart(e.target.value)}
              className={cn(
                "mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
                "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                errors.anchorSleepStart && "border-[#ff8a8a]/50",
                disabled && "opacity-50",
              )}
              aria-invalid={errors.anchorSleepStart ? true : undefined}
              aria-describedby={
                errors.anchorSleepStart ? "anchor-start-err" : undefined
              }
            />
            {errors.anchorSleepStart ? (
              <p
                id="anchor-start-err"
                className="mt-1.5 text-sm text-[#ff8a8a]"
                role="alert"
              >
                {errors.anchorSleepStart}
              </p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="anchor-end"
              className="text-xs font-medium text-[#7d89a6]"
            >
              End
            </label>
            <input
              id="anchor-end"
              type="time"
              disabled={disabled}
              value={anchorSleepEnd}
              onChange={(e) => onAnchorEnd(e.target.value)}
              className={cn(
                "mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
                "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                errors.anchorSleepEnd && "border-[#ff8a8a]/50",
                disabled && "opacity-50",
              )}
              aria-invalid={errors.anchorSleepEnd ? true : undefined}
              aria-describedby={
                errors.anchorSleepEnd ? "anchor-end-err" : undefined
              }
            />
            {errors.anchorSleepEnd ? (
              <p
                id="anchor-end-err"
                className="mt-1.5 text-sm text-[#ff8a8a]"
                role="alert"
              >
                {errors.anchorSleepEnd}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="anchor-note" className="text-xs font-medium text-[#7d89a6]">
            Consistency note (optional)
          </label>
          <textarea
            id="anchor-note"
            rows={3}
            disabled={disabled}
            value={anchorNote}
            onChange={(e) => onAnchorNote(e.target.value)}
            placeholder="e.g. Earplugs after night shifts, blackout until 10 AM when possible…"
            className={cn(
              "mt-1.5 w-full resize-y rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
              disabled && "opacity-50",
            )}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="sleep-constraint" className={nx.labelUpper}>
            Sleep constraint
          </label>
          <select
            id="sleep-constraint"
            disabled={disabled}
            value={sleepConstraint}
            onChange={(e) =>
              onSleepConstraint(e.target.value as SleepConstraint)
            }
            className={cn(
              "mt-3 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
              disabled && "opacity-50",
            )}
          >
            {CONSTRAINTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="caffeine-habit" className={nx.labelUpper}>
            Caffeine pattern
          </label>
          <select
            id="caffeine-habit"
            disabled={disabled}
            value={caffeineHabit}
            onChange={(e) =>
              onCaffeineHabit(e.target.value as CaffeineHabit)
            }
            className={cn(
              "mt-3 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
              "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
              disabled && "opacity-50",
            )}
          >
            {CAFFEINE.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
