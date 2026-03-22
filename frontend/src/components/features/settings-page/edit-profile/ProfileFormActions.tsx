"use client";

import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

type ProfileFormActionsProps = {
  onCancel: () => void;
  onSave: () => void;
  saveDisabled: boolean;
  saving: boolean;
  cancelDisabled?: boolean;
};

export function ProfileFormActions({
  onCancel,
  onSave,
  saveDisabled,
  saving,
  cancelDisabled,
}: ProfileFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={cancelDisabled || saving}
        className={cn(
          "rounded-2xl border border-white/[0.1] px-5 py-3 text-sm font-semibold text-[#edf2ff] transition-colors",
          "hover:bg-white/[0.04] disabled:opacity-45",
          nx.focusRing,
        )}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled || saving}
        className={cn(
          nx.primaryButton,
          "px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-45",
          nx.focusRing,
        )}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
