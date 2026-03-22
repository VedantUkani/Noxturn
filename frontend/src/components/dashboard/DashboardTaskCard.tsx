"use client";

import type { DashboardTask } from "@/lib/dashboard-types";
import { IconClock } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

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
        "rounded-[22px] border border-white/[0.08] bg-[#141f42]/90 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-opacity md:p-5",
        task.anchor
          ? "border-[#45e0d4]/28 shadow-[0_0_36px_-20px_rgba(69,224,212,0.2),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
          : "",
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
                  ? "bg-[#45e0d4]/15 text-[#a8fff7]"
                  : "bg-[#101c3c] text-[#7d89a6]",
              )}
            >
              {task.anchor ? "Anchor" : "Support"}
            </span>
            <span className="text-[11px] text-[#7d89a6]">
              {fmtWhen(task.scheduled_time)} · {task.duration_minutes} min
            </span>
          </div>
          <h4 className="mt-2 text-sm font-semibold text-[#edf2ff] md:text-[15px]">
            {task.title}
          </h4>
          {snoozed && task.snoozedUntil ? (
            <p className="mt-1 text-xs text-[#f7c22c]/90">
              Snoozed until {fmtWhen(task.snoozedUntil)}
            </p>
          ) : null}
          {task.status === "skipped" ? (
            <p className="mt-1 text-xs text-[#7d89a6]">Skipped</p>
          ) : null}
          {task.status === "replaced" ? (
            <p className="mt-1 text-xs text-[#7d89a6]">Superseded by a newer step</p>
          ) : null}
          {task.status === "completed" ? (
            <p className="mt-1 text-xs text-[#45e0d4]/85">Completed</p>
          ) : null}
          {task.status === "expired" ? (
            <p className="mt-1 text-xs text-[#7d89a6]">
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
            className={cn(
              "rounded-xl bg-[#45e0d4] px-3 py-1.5 text-xs font-bold text-[#04112d] transition hover:brightness-105",
              nx.focusRing,
            )}
          >
            Done
          </button>
          <button
            type="button"
            onClick={onSkip}
            className={cn(
              "rounded-xl border border-white/[0.12] bg-[#101c3c] px-3 py-1.5 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.18]",
              nx.focusRing,
            )}
          >
            Skip
          </button>
          {task.status === "planned" ? (
            <button
              type="button"
              onClick={onMissed}
              className={cn(
                "rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#7d89a6] underline-offset-2 hover:text-[#98a4bf] hover:underline",
                nx.focusRing,
              )}
            >
              Missed window
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSnooze}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl border border-white/[0.12] bg-[#101c3c] px-3 py-1.5 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.18]",
              nx.focusRing,
            )}
          >
            <IconClock className="h-3.5 w-3.5" aria-hidden />
            Snooze
          </button>
          <button
            type="button"
            onClick={onDetails}
            className={cn(
              "ml-auto rounded-lg px-3 py-1.5 text-xs font-medium text-[#86c9ff] underline-offset-2 hover:underline",
              nx.focusRing,
            )}
          >
            Details
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onDetails}
          className={cn(
            "mt-3 text-xs font-medium text-[#86c9ff] hover:underline",
            nx.focusRing,
          )}
        >
          View details
        </button>
      )}
    </article>
  );
}
