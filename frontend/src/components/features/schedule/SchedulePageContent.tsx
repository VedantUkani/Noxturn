import { APP_NAME } from "@/lib/constants";
import { ScheduleEditorClient } from "./ScheduleEditorClient";
import { ScheduleFooterBack } from "./ScheduleFooterBack";

export function SchedulePageContent() {
  return (
    <div className="mx-auto max-w-xl space-y-8 pb-10">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        Schedule
      </p>

      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Add your shifts
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Connect Google or Outlook, upload CSV / Excel / .ics, or add shifts
          with +. Blocks stay on this device; file uploads also hit your API
          when it&apos;s running. When you&apos;re done, open the app from{" "}
          <strong className="font-medium text-slate-300">{APP_NAME}</strong>{" "}
          above. No roster handy? Use the{" "}
          <strong className="font-medium text-slate-300">Back</strong> button
          below — then{" "}
          <strong className="font-medium text-slate-300">Skip for now</strong>{" "}
          on the welcome screen, or{" "}
          <strong className="font-medium text-slate-300">Home</strong> when
          you&apos;ve already finished welcome once.
        </p>
      </header>

      <ScheduleEditorClient />

      <ScheduleFooterBack />
    </div>
  );
}
