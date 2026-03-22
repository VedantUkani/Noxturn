"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import type { RoleId } from "@/components/features/onboarding-flow/types";
import type { UserProfileSettings, TransportMode } from "@/lib/user-profile-settings";
import { CommuteEditor } from "./edit-profile/CommuteEditor";
import { IconCarCommute } from "./settings-icons";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";
const fieldLabel = "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]";

const ROLES: { id: RoleId; title: string; description: string }[] = [
  { id: "nurse", title: "Nurse / RN", description: "Ward, ICU, or emergency rotations" },
  { id: "resident", title: "Medical Resident", description: "Graduate medical training" },
  { id: "paramedic", title: "Paramedic / EMT", description: "Extended duty and turnaround shifts" },
  { id: "factory_worker", title: "Factory / Shift Worker", description: "Rotating or fixed industrial shifts" },
  { id: "other", title: "Other", description: "Another role with rotating hours" },
];

const ROLE_TITLES: Record<RoleId, string> = {
  nurse: "Nurse / RN",
  paramedic: "Paramedic / EMT",
  factory_worker: "Factory / Shift Worker",
  resident: "Medical Resident",
  other: "Other",
};

type Props = {
  profile: UserProfileSettings;
  onSave: (updated: UserProfileSettings) => Promise<void>;
};

export function ProfileAccountCardEditable({ profile, onSave }: Props) {
  const id = useId();
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
    if (!values.fullName.trim() || !values.roleId) return;
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
    <section className={cn("p-6 sm:p-8", card)} aria-labelledby="profile-account-heading">
      <div className="flex items-center justify-between gap-4">
        <h2 id="profile-account-heading" className="text-lg font-semibold text-[#45e0d4]">
          Profile & Account
        </h2>
        {!editing ? (
          <button
            type="button"
            onClick={handleEdit}
            className={cn(
              "rounded-xl border border-white/[0.1] bg-[#0f1b3a] px-4 py-2 text-sm font-medium text-[#98a4bf]",
              "hover:border-[#45e0d4]/30 hover:text-[#45e0d4] transition-all",
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
                "rounded-xl border border-[#45e0d4]/40 bg-[#0c1f3d] px-4 py-2 text-sm font-medium text-[#45e0d4]",
                "hover:bg-[#0c2a3d] transition-all disabled:opacity-50",
                nx.focusRing,
              )}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {success && (
        <p className="mt-3 rounded-xl border border-[#45e0d4]/25 bg-[#0c1f3d]/55 px-3 py-2 text-sm text-[#45e0d4]">
          Profile saved.
        </p>
      )}

      {!editing ? (
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="space-y-8">
            <div>
              <p className={fieldLabel}>Full name</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-[#edf2ff]">
                {profile.fullName || "—"}
              </p>
            </div>
            <div>
              <p className={fieldLabel}>Commute duration</p>
              <p className="mt-2 flex items-center gap-2 text-base font-medium text-[#45e0d4]">
                <IconCarCommute className="shrink-0" />
                <span>{profile.commuteMinutes} Minutes</span>
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <p className={fieldLabel}>Clinical / worker role</p>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center rounded-lg bg-[#6ea8ff]/25 px-2.5 py-1 text-xs font-semibold text-[#c8daff]">
                  {ROLE_TITLES[profile.roleId]}
                </span>
                {profile.roleSpecialty && (
                  <span className="text-base font-medium text-[#edf2ff]">{profile.roleSpecialty}</span>
                )}
              </div>
            </div>
            <div>
              <p className={fieldLabel}>Email</p>
              <p className="mt-2 text-base text-[#98a4bf]">{profile.email || "—"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className={nx.labelUpper}>Full name</label>
              <input
                id={`${id}-name`}
                autoComplete="name"
                value={values.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
                disabled={saving}
                className={cn(
                  "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
                  "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  saving && "opacity-50",
                )}
              />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className={nx.labelUpper}>Email</label>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => patch({ email: e.target.value })}
                disabled={saving}
                className={cn(
                  "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
                  "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                  saving && "opacity-50",
                )}
              />
            </div>
          </div>

          <div>
            <p className={nx.labelUpper}>Clinical / worker role</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup">
              {ROLES.map((role) => {
                const selected = values.roleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={saving}
                    onClick={() => patch({ roleId: role.id })}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition-all duration-150",
                      selected
                        ? "border-[#45e0d4] bg-[#0c2a3d] shadow-[0_0_0_1px_rgba(69,224,212,0.4)]"
                        : "border-white/[0.08] bg-[#0f1b3a]/80 hover:border-[#45e0d4]/30",
                      saving && "pointer-events-none opacity-50",
                      nx.focusRing,
                    )}
                  >
                    <span className={cn("block text-sm font-semibold", selected ? "text-[#45e0d4]" : "text-[#edf2ff]")}>
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
              <span className="ml-1 font-normal normal-case text-[#5c6a85]">(optional)</span>
            </label>
            <input
              id={`${id}-specialty`}
              value={values.roleSpecialty}
              onChange={(e) => patch({ roleSpecialty: e.target.value })}
              disabled={saving}
              placeholder="e.g. ICU nights, Internal Medicine…"
              className={cn(
                "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
                "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                saving && "opacity-50",
              )}
            />
          </div>

          <div className="rounded-[22px] border border-white/[0.06] bg-[#0f1b3a]/60 p-5">
            <p className={cn(nx.labelUpper, "mb-4")}>Commute & transport</p>
            <CommuteEditor
              minutes={values.commuteMinutes}
              transportMode={values.transportMode}
              onMinutesChange={(commuteMinutes) => patch({ commuteMinutes })}
              onTransportChange={(transportMode: TransportMode) => patch({ transportMode })}
              disabled={saving}
            />
          </div>
        </div>
      )}
    </section>
  );
}
