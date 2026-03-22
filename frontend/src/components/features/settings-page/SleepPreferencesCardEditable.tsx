"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import type { UserProfileSettings } from "@/lib/user-profile-settings";
import { SleepWindowEditor } from "./edit-profile/SleepWindowEditor";
import type { SleepPreferencesModel } from "./types";
import { AnchorSleepWindow } from "./AnchorSleepWindow";
import { ChronotypeCard } from "./ChronotypeCard";
import { SleepDurationDisplay } from "./SleepDurationDisplay";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";
const colLabel = "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]";

type Props = {
  data: SleepPreferencesModel;
  profile: UserProfileSettings;
  onSave: (updated: UserProfileSettings) => Promise<void>;
};

export function SleepPreferencesCardEditable({ data, profile, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<UserProfileSettings>(profile);
  const [success, setSuccess] = useState(false);

  const patch = (p: Partial<UserProfileSettings>) =>
    setValues((v) => ({ ...v, ...p }));

  const handleEdit = () => {
    setValues(profile);
    setSuccess(false);
    setEditing(true);
  };

  const handleCancel = () => setEditing(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(values);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cn("p-6 sm:p-8", card)} aria-labelledby="sleep-preferences-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="sleep-preferences-heading" className="text-lg font-semibold text-[#f4c22b]">
          {data.cardTitle}
        </h2>
        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className={cn(
              "rounded-xl border border-white/[0.1] bg-[#0f1b3a] px-4 py-2 text-sm font-medium text-[#98a4bf]",
              "hover:border-[#f4c22b]/30 hover:text-[#f4c22b] transition-all",
              nx.focusRing,
            )}
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-[#7d89a6] hover:text-[#edf2ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "rounded-xl border border-[#f4c22b]/40 bg-[#1f1a05] px-4 py-2 text-sm font-medium text-[#f4c22b]",
                "hover:bg-[#2a2306] transition-all disabled:opacity-50",
                nx.focusRing,
              )}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {success && (
        <p className="mt-3 rounded-xl border border-[#f4c22b]/25 bg-[#1f1a05]/55 px-3 py-2 text-sm text-[#f4c22b]">
          Sleep preferences saved.
        </p>
      )}

      {!editing ? (
        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-8 xl:gap-10">
          <div className="space-y-4">
            <p className={colLabel}>{data.chronotype.columnLabel}</p>
            <ChronotypeCard data={data.chronotype} />
          </div>
          <div className="space-y-4">
            <p className={colLabel}>{data.duration.columnLabel}</p>
            <SleepDurationDisplay data={data.duration} />
          </div>
          <div className="space-y-4">
            <p className={colLabel}>{data.anchor.columnLabel}</p>
            <AnchorSleepWindow data={data.anchor} />
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5 sm:p-6">
          <SleepWindowEditor
            chronotype={values.chronotype}
            preferredSleepHours={values.preferredSleepHours}
            anchorSleepStart={values.anchorSleepStart}
            anchorSleepEnd={values.anchorSleepEnd}
            anchorNote={values.anchorNote}
            sleepConstraint={values.sleepConstraint}
            caffeineHabit={values.caffeineHabit}
            onChronotype={(chronotype) => patch({ chronotype })}
            onPreferredSleepHours={(preferredSleepHours) => patch({ preferredSleepHours })}
            onAnchorStart={(anchorSleepStart) => patch({ anchorSleepStart })}
            onAnchorEnd={(anchorSleepEnd) => patch({ anchorSleepEnd })}
            onAnchorNote={(anchorNote) => patch({ anchorNote })}
            onSleepConstraint={(sleepConstraint) => patch({ sleepConstraint })}
            onCaffeineHabit={(caffeineHabit) => patch({ caffeineHabit })}
            errors={{}}
            disabled={saving}
          />
        </div>
      )}
    </section>
  );
}
