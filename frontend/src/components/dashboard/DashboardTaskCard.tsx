"use client";

import type { DashboardTask } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function CheckCircle({ done }: { done: boolean }) {
  if (done)
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-[#45e0d4]" fill="none">
        <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity={0.15} stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <div className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
  );
}

type Props = {
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
  onSnooze,
  onDetails,
}: Props) {
  const done =
    task.status === "completed" ||
    task.status === "skipped" ||
    task.status === "expired" ||
    task.status === "replaced";

  const startLabel = task.scheduled_time ? fmtTime(task.scheduled_time) : null;
  const durationLabel = fmtDuration(task.duration_minutes);

  const statusNote =
    task.status === "completed" ? "Completed" :
    task.status === "skipped" ? "Skipped" :
    task.status === "expired" ? "Window passed" :
    task.status === "replaced" ? "Superseded" :
    task.status === "snoozed" && task.snoozedUntil
      ? `Snoozed until ${fmtTime(task.snoozedUntil)}`
      : null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 transition-opacity",
        done && "opacity-45",
      )}
    >
      {/* Circle */}
      <button
        type="button"
        aria-label={done ? "Completed" : "Mark as done"}
        onClick={!done ? onComplete : undefined}
        className={cn(
          "mt-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0d4]/50 rounded-full",
          !done && "cursor-pointer",
        )}
      >
        <CheckCircle done={done} />
      </button>

      <div className="min-w-0 flex-1">
        {/* Title */}
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            done ? "text-[#7d89a6] line-through" : "text-[#edf2ff]",
          )}
        >
          {task.title}
        </p>

        {/* Start time + duration */}
        <div className="mt-1 flex items-center gap-2">
          {startLabel ? (
            <span className="text-xs font-semibold text-[#45e0d4]">
              Start {startLabel}
            </span>
          ) : null}
          <span className={cn("text-xs tabular-nums", startLabel ? "text-[#7d89a6]" : "font-semibold text-[#45e0d4]")}>
            {startLabel ? `· ${durationLabel}` : durationLabel}
          </span>
        </div>

        {/* Status note */}
        {statusNote ? (
          <p className={cn(
            "mt-0.5 text-[11px]",
            task.status === "completed" ? "text-[#45e0d4]/70" :
            task.status === "snoozed" ? "text-amber-400/80" :
            "text-[#7d89a6]",
          )}>
            {statusNote}
          </p>
        ) : null}

        {/* Actions — only for active tasks */}
        {!done && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={onComplete}
              className="rounded-md bg-[#45e0d4]/10 px-2.5 py-1 text-[11px] font-semibold text-[#45e0d4] transition hover:bg-[#45e0d4]/20"
            >
              Done
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-md border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#7d89a6] transition hover:border-white/[0.15] hover:text-[#98a4bf]"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={onSnooze}
              className="rounded-md border border-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-[#7d89a6] transition hover:border-white/[0.15] hover:text-[#98a4bf]"
            >
              Snooze
            </button>
            <button
              type="button"
              onClick={onDetails}
              className="ml-auto text-[11px] font-medium text-[#86c9ff]/60 transition hover:text-[#86c9ff]"
            >
              Details →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
