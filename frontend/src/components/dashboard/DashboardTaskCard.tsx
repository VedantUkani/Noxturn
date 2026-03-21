"use client";

import type { DashboardTask } from "@/lib/dashboard-types";
import { IconClock } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

function fmtWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

type DashboardTaskCardProps = {
  task: DashboardTask;
  onComplete: () => void;
  onSkip: () => void;
  onMissed: () => void;
  onSnooze: () => void;
  onDetails: () => void;
};

export function DashboardTaskCard({
  task,
  onComplete,
  onSkip,
  onMissed,
  onSnooze,
  onDetails,
}: DashboardTaskCardProps) {
  const done =
    task.status === "completed" ||
    task.status === "skipped" ||
    task.status === "expired" ||
    task.status === "replaced";
  const snoozed = task.status === "snoozed";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-slate-900/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-opacity md:p-5",
        task.anchor
          ? "border-teal-400/28 shadow-[0_0_36px_-20px_rgba(45,212,191,0.22),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "border-slate-700/40",
        done && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                task.anchor
                  ? "bg-teal-400/15 text-teal-200/90"
                  : "bg-slate-700/50 text-slate-400",
              )}
            >
              {task.anchor ? "Anchor" : "Support"}
            </span>
            <span className="text-[11px] text-slate-500">
              {fmtWhen(task.scheduled_time)} · {task.duration_minutes} min
            </span>
          </div>
          <h4 className="mt-2 text-sm font-semibold text-slate-100 md:text-[15px]">
            {task.title}
          </h4>
          {snoozed && task.snoozedUntil ? (
            <p className="mt-1 text-xs text-amber-200/80">
              Snoozed until {fmtWhen(task.snoozedUntil)}
            </p>
          ) : null}
          {task.status === "skipped" ? (
            <p className="mt-1 text-xs text-slate-500">Skipped</p>
          ) : null}
          {task.status === "replaced" ? (
            <p className="mt-1 text-xs text-slate-500">Superseded by a newer step</p>
          ) : null}
          {task.status === "completed" ? (
            <p className="mt-1 text-xs text-teal-300/70">Completed</p>
          ) : null}
          {task.status === "expired" ? (
            <p className="mt-1 text-xs text-slate-500">
              Window passed — noted without judgment.
            </p>
          ) : null}
        </div>
      </div>

      {!done ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg bg-teal-400/90 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-slate-600/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/50"
          >
            Skip
          </button>
          {task.status === "planned" ? (
            <button
              type="button"
              onClick={onMissed}
              className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-400 hover:underline"
            >
              Missed window
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSnooze}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-600/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800/50"
          >
            <IconClock className="h-3.5 w-3.5" aria-hidden />
            Snooze
          </button>
          <button
            type="button"
            onClick={onDetails}
            className="ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-teal-300/90 underline-offset-2 hover:underline"
          >
            Details
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onDetails}
          className="mt-3 text-xs font-medium text-teal-300/80 hover:underline"
        >
          View details
        </button>
      )}
    </article>
  );
}
