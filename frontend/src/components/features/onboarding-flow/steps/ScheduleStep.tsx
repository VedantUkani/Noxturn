"use client";

import { APP_NAME } from "@/lib/constants";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";
import type { OnboardingDraft } from "../types";
import { ScheduleEditorClient } from "@/components/features/schedule/ScheduleEditorClient";

type ScheduleStepProps = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

/**
 * Same roster experience as `/schedule`: imports, calendar hooks, uploads, + manual blocks
 * — all persisted via `getStoredScheduleBlocks` / `storeScheduleBlocks`.
 */
export function ScheduleStep({ draft, onChange }: ScheduleStepProps) {
  if (draft.scheduleDeferred) {
    return (
      <div className={cn(nx.card, "p-6 text-center")}>
        <p className="text-sm font-medium text-[#edf2ff]">
          You can finish your rota anytime from{" "}
          <span className="text-[#45e0d4]">Roster &amp; schedule</span> in the
          sidebar.
        </p>
        <p className="mt-2 text-xs text-[#7d89a6]">
          Want to add shifts now? Use the same import tools as the main schedule
          page.
        </p>
        <button
          type="button"
          onClick={() => onChange({ scheduleDeferred: false })}
          className={cn(
            nx.primaryButton,
            "mt-6 inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-sm",
            nx.focusRing,
          )}
        >
          Add schedule now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7d89a6]">
          Bring in your rota
        </p>
        <p className="text-sm leading-relaxed text-[#98a4bf]">
          Same tools as <strong className="font-medium text-[#edf2ff]">Roster &amp; schedule</strong>
          : Google Calendar, Outlook, CSV / Excel / .ics upload, or{" "}
          <span className="font-medium text-[#edf2ff]">+</span> for manual blocks.
          Data stays on this device; uploads use your API when{" "}
          <strong className="font-medium text-[#edf2ff]">{APP_NAME}</strong> backend
          is running.
        </p>
      </div>

      <div
        className={cn(
          "rounded-[22px] border border-white/[0.06] bg-[#0f172a]/90 p-4 sm:p-6",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        )}
      >
        <ScheduleEditorClient />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-[22px] border border-white/[0.08] bg-[#141f42]/60 px-4 py-4">
        <input
          type="checkbox"
          checked={draft.scheduleDeferred}
          onChange={(e) => {
            const on = e.target.checked;
            onChange({
              scheduleDeferred: on,
              importComplete: on ? null : draft.importComplete,
            });
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#45e0d4]"
        />
        <span className="text-sm text-[#98a4bf]">
          <span className="font-medium text-[#edf2ff]">
            I&apos;ll set up my schedule in the app next
          </span>
          <span className="mt-1 block text-xs text-[#7d89a6]">
            Skip for now — use <strong className="font-medium text-[#98a4bf]">Roster &amp; schedule</strong>{" "}
            whenever you&apos;re ready.
          </span>
        </span>
      </label>
    </div>
  );
}
