"use client";

import { useEffect } from "react";
import type { DashboardTask } from "@/lib/dashboard-types";
import { IconClose } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

type TaskDetailSheetProps = {
  task: DashboardTask | null;
  open: boolean;
  onClose: () => void;
  onOpenEvidence?: () => void;
};

export function TaskDetailSheet({
  task,
  open,
  onClose,
  onOpenEvidence,
}: TaskDetailSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[1] w-full max-w-md rounded-2xl border border-slate-700/50 bg-[#0c1220] p-5 shadow-2xl",
          "shadow-[0_24px_64px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {task.anchor ? "Anchor task" : "Support task"}
            </p>
            <h2
              id="task-detail-title"
              className="mt-1 text-lg font-semibold tracking-tight text-white"
            >
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/40"
            aria-label="Close details"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        {onOpenEvidence ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={onOpenEvidence}
              className="text-xs font-semibold text-teal-300/90 underline-offset-4 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/40"
            >
              Open evidence lens
            </button>
          </div>
        ) : null}

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Category</dt>
            <dd className="mt-0.5 text-slate-200">
              {task.category.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Status</dt>
            <dd className="mt-0.5 text-slate-200">
              {task.status === "expired"
                ? "Missed window"
                : task.status === "snoozed"
                  ? "Snoozed"
                  : task.status === "replaced"
                    ? "Replaced by a newer plan step"
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Why it&apos;s here</dt>
            <dd className="mt-0.5 leading-relaxed text-slate-400">
              {task.rationale}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
