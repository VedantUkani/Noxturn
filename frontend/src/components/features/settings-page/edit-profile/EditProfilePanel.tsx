"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconClose } from "@/components/icons/NavIcons";
import {
  persistUserProfileSettings,
  type UserProfileSettings,
} from "@/lib/user-profile-settings";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";
import { CommuteEditor } from "./CommuteEditor";
import { ProfileFormActions } from "./ProfileFormActions";
import { RoleSelector } from "./RoleSelector";
import { SleepWindowEditor } from "./SleepWindowEditor";
import {
  validateUserProfileSettings,
  type EditProfileFieldErrors,
} from "./validate-edit-profile";

type EditProfilePanelProps = {
  open: boolean;
  initialProfile: UserProfileSettings;
  onClose: () => void;
  onSaved: (profile: UserProfileSettings) => void;
};

function serialize(p: UserProfileSettings): string {
  return JSON.stringify(p);
}

export function EditProfilePanel({
  open,
  initialProfile,
  onClose,
  onSaved,
}: EditProfilePanelProps) {
  const [values, setValues] = useState<UserProfileSettings>(initialProfile);
  const [errors, setErrors] = useState<EditProfileFieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const baselineRef = useRef(serialize(initialProfile));
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setValues(initialProfile);
      baselineRef.current = serialize(initialProfile);
      setErrors({});
      setSaveError(null);
      setSuccess(false);
    }
    wasOpenRef.current = open;
  }, [open, initialProfile]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /** Recompute every render so updates to `baselineRef` after save clear “dirty”. */
  const dirty = serialize(values) !== baselineRef.current;

  const requestClose = useCallback(() => {
    if (saving) return;
    if (dirty) {
      const ok = window.confirm(
        "Discard changes to your profile? Unsaved edits will be lost.",
      );
      if (!ok) return;
    }
    onClose();
  }, [dirty, onClose, saving]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  const patch = useCallback((p: Partial<UserProfileSettings>) => {
    setValues((v) => ({ ...v, ...p }));
    setSuccess(false);
  }, []);

  const handleSave = async () => {
    const nextErrors = validateUserProfileSettings(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSaveError("Check the highlighted fields and try again.");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await persistUserProfileSettings(values);
      baselineRef.current = serialize(values);
      onSaved(values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4200);
    } catch {
      setSaveError("Something went wrong while saving. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="presentation"
    >
      <button
        type="button"
        className={cn("absolute inset-0 cursor-default", nx.overlay)}
        aria-label="Close edit profile"
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-full flex-col border-l border-white/[0.08] bg-[#070f24] shadow-[0_0_80px_-20px_rgba(0,0,0,0.9)] sm:max-w-lg md:max-w-xl",
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className={nx.labelUpper}>Account</p>
            <h2
              id="edit-profile-title"
              className="mt-2 text-xl font-semibold tracking-tight text-[#edf2ff] sm:text-2xl"
            >
              Edit profile
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#98a4bf]">
              Update how Noxturn understands your work context and sleep
              preferences. This is your live profile — not a first-time setup.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className={cn(
              "shrink-0 rounded-xl p-2 text-[#98a4bf] hover:bg-white/[0.06] hover:text-[#edf2ff]",
              nx.focusRing,
              saving && "pointer-events-none opacity-50",
            )}
            aria-label="Close"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </header>

        {success ? (
          <div
            className="mx-5 mt-4 rounded-2xl border border-[#45e0d4]/25 bg-[#0c1f3d]/55 px-4 py-3 text-sm text-[#45e0d4] sm:mx-7"
            role="status"
          >
            Profile saved. Your settings cards now reflect these updates.
          </div>
        ) : null}

        {saveError ? (
          <div
            className="mx-5 mt-4 rounded-2xl border border-[#ff8a8a]/25 bg-[#2a1018]/35 px-4 py-3 text-sm text-[#ffb4b4] sm:mx-7"
            role="alert"
          >
            {saveError}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
          <div className="space-y-10 pb-4">
            <section aria-labelledby="sec-basics">
              <h3
                id="sec-basics"
                className="text-sm font-semibold tracking-tight text-[#45e0d4]"
              >
                Basic profile
              </h3>
              <p className="mt-1 text-xs text-[#7d89a6]">
                Identity used across your workspace and recovery summaries.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="profile-full-name" className={nx.labelUpper}>
                    Full name
                  </label>
                  <input
                    id="profile-full-name"
                    autoComplete="name"
                    disabled={saving}
                    value={values.fullName}
                    onChange={(e) => patch({ fullName: e.target.value })}
                    className={cn(
                      "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
                      "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                      errors.fullName && "border-[#ff8a8a]/45",
                      saving && "opacity-50",
                    )}
                    aria-invalid={errors.fullName ? true : undefined}
                    aria-describedby={
                      errors.fullName ? "full-name-err" : undefined
                    }
                  />
                  {errors.fullName ? (
                    <p
                      id="full-name-err"
                      className="mt-1.5 text-sm text-[#ff8a8a]"
                      role="alert"
                    >
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="profile-email" className={nx.labelUpper}>
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    disabled={saving}
                    value={values.email}
                    onChange={(e) => patch({ email: e.target.value })}
                    className={cn(
                      "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff]",
                      "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                      errors.email && "border-[#ff8a8a]/45",
                      saving && "opacity-50",
                    )}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "email-err" : undefined}
                  />
                  {errors.email ? (
                    <p
                      id="email-err"
                      className="mt-1.5 text-sm text-[#ff8a8a]"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className={nx.labelUpper}>Clinical / worker role</p>
                  <div className="mt-3">
                    <RoleSelector
                      value={values.roleId}
                      onChange={(roleId) => patch({ roleId })}
                      error={errors.roleId}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="profile-specialty" className={nx.labelUpper}>
                    Department / specialty / detail
                  </label>
                  <input
                    id="profile-specialty"
                    disabled={saving}
                    value={values.roleSpecialty}
                    onChange={(e) => patch({ roleSpecialty: e.target.value })}
                    placeholder="e.g. Internal Medicine, ICU nights…"
                    className={cn(
                      "mt-2 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-sm text-[#edf2ff] placeholder:text-[#5c6a85]",
                      "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                      saving && "opacity-50",
                    )}
                  />
                </div>
              </div>
            </section>

            <section aria-labelledby="sec-work">
              <h3
                id="sec-work"
                className="text-sm font-semibold tracking-tight text-[#45e0d4]"
              >
                Commute & work context
              </h3>
              <p className="mt-1 text-xs text-[#7d89a6]">
                Travel burden shapes how much protected time you need between
                duties.
              </p>
              <div className={cn("mt-5 rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5")}>
                <CommuteEditor
                  minutes={values.commuteMinutes}
                  transportMode={values.transportMode}
                  onMinutesChange={(commuteMinutes) => patch({ commuteMinutes })}
                  onTransportChange={(transportMode) =>
                    patch({ transportMode })
                  }
                  error={errors.commuteMinutes}
                  disabled={saving}
                />
              </div>
            </section>

            <section aria-labelledby="sec-sleep">
              <h3
                id="sec-sleep"
                className="text-sm font-semibold tracking-tight text-[#f4c22b]"
              >
                Sleep & recovery preferences
              </h3>
              <p className="mt-1 text-xs text-[#7d89a6]">
                Personal sleep profile — separate from shift scheduling tools.
              </p>
              <div className={cn("mt-5 rounded-[22px] border border-white/[0.06] bg-[#141f42]/60 p-5 sm:p-6")}>
                <SleepWindowEditor
                  chronotype={values.chronotype}
                  preferredSleepHours={values.preferredSleepHours}
                  anchorSleepStart={values.anchorSleepStart}
                  anchorSleepEnd={values.anchorSleepEnd}
                  anchorNote={values.anchorNote}
                  sleepConstraint={values.sleepConstraint}
                  caffeineHabit={values.caffeineHabit}
                  onChronotype={(chronotype) => patch({ chronotype })}
                  onPreferredSleepHours={(preferredSleepHours) =>
                    patch({ preferredSleepHours })
                  }
                  onAnchorStart={(anchorSleepStart) =>
                    patch({ anchorSleepStart })
                  }
                  onAnchorEnd={(anchorSleepEnd) => patch({ anchorSleepEnd })}
                  onAnchorNote={(anchorNote) => patch({ anchorNote })}
                  onSleepConstraint={(sleepConstraint) =>
                    patch({ sleepConstraint })
                  }
                  onCaffeineHabit={(caffeineHabit) => patch({ caffeineHabit })}
                  errors={{
                    preferredSleepHours: errors.preferredSleepHours,
                    anchorSleepStart: errors.anchorSleepStart,
                    anchorSleepEnd: errors.anchorSleepEnd,
                  }}
                  disabled={saving}
                />
              </div>
            </section>

            <section aria-labelledby="sec-buddy">
              <h3
                id="sec-buddy"
                className="text-sm font-semibold tracking-tight text-[#86c9ff]"
              >
                Support & buddy check-ins
              </h3>
              <p className="mt-1 text-xs text-[#7d89a6]">
                Optional. Enable only if you want recovery check-in scaffolding.
              </p>
              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  aria-pressed={values.buddyCheckinsEnabled}
                  disabled={saving}
                  onClick={() =>
                    patch({
                      buddyCheckinsEnabled: !values.buddyCheckinsEnabled,
                    })
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                    values.buddyCheckinsEnabled
                      ? "border-[#45e0d4]/30 bg-[#0c1f3d]/40"
                      : "border-white/[0.08] bg-[#0f1b3a]/50",
                    nx.focusRing,
                    saving && "pointer-events-none opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                      values.buddyCheckinsEnabled
                        ? "border-[#45e0d4] bg-[#45e0d4]"
                        : "border-white/[0.2]",
                    )}
                    aria-hidden
                  >
                    {values.buddyCheckinsEnabled ? (
                      <svg
                        className="h-3 w-3 text-[#04112d]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : null}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-[#edf2ff]">
                      Trusted contact check-ins
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#7d89a6]">
                      We never message anyone without your explicit setup in a
                      future connection flow.
                    </span>
                  </span>
                </button>

                {values.buddyCheckinsEnabled ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="buddy-name"
                        className="text-xs font-medium text-[#7d89a6]"
                      >
                        Contact name
                      </label>
                      <input
                        id="buddy-name"
                        disabled={saving}
                        value={values.trustedContactName}
                        onChange={(e) =>
                          patch({ trustedContactName: e.target.value })
                        }
                        className={cn(
                          "mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
                          "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                          errors.trustedContactName && "border-[#ff8a8a]/45",
                          saving && "opacity-50",
                        )}
                        aria-invalid={
                          errors.trustedContactName ? true : undefined
                        }
                      />
                      {errors.trustedContactName ? (
                        <p className="mt-1 text-sm text-[#ff8a8a]" role="alert">
                          {errors.trustedContactName}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="buddy-detail"
                        className="text-xs font-medium text-[#7d89a6]"
                      >
                        Email or phone
                      </label>
                      <input
                        id="buddy-detail"
                        disabled={saving}
                        value={values.trustedContactDetail}
                        onChange={(e) =>
                          patch({ trustedContactDetail: e.target.value })
                        }
                        className={cn(
                          "mt-1.5 w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3 py-2.5 text-sm text-[#edf2ff]",
                          "focus:border-[#45e0d4]/45 focus:outline-none focus:ring-2 focus:ring-[#45e0d4]/25",
                          errors.trustedContactDetail && "border-[#ff8a8a]/45",
                          saving && "opacity-50",
                        )}
                        aria-invalid={
                          errors.trustedContactDetail ? true : undefined
                        }
                      />
                      {errors.trustedContactDetail ? (
                        <p className="mt-1 text-sm text-[#ff8a8a]" role="alert">
                          {errors.trustedContactDetail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <ProfileFormActions
            onCancel={requestClose}
            onSave={handleSave}
            saveDisabled={!dirty}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}
