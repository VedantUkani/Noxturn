"use client";

type EditProfileTriggerProps = {
  label: string;
  onClick: () => void;
};

/** Text trigger aligned with existing settings link styling. */
export function EditProfileTrigger({ label, onClick }: EditProfileTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 self-start text-sm font-semibold text-[#45e0d4] underline-offset-4 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35 sm:mt-1"
    >
      {label}
    </button>
  );
}
