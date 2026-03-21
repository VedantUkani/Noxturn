"use client";

import { type PlanTask } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { IconCheck, IconX, IconInfo, IconClock } from "@/components/icons";

type Props = {
  task: PlanTask;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onEvidence: (task: PlanTask) => void;
  loading?: boolean;
};

const CATEGORY_ICON: Record<string, string> = {
  sleep:          "😴",
  nap:            "💤",
  caffeine_cutoff: "☕",
  light_timing:   "💡",
  meal:           "🍽",
  movement:       "🚶",
  safety:         "🛡",
  mindfulness:    "🧘",
  relaxation:     "🌿",
  buddy_checkin:  "👥",
  social:         "💬",
};

export function TaskCard({ task, onComplete, onSkip, onEvidence, loading = false }: Props) {
  const isActive = task.status === "planned";
  const emoji = CATEGORY_ICON[task.category ?? ""] ?? "✦";

  const time = task.scheduled_time
    ? new Date(task.scheduled_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      className={[
        "rounded-xl border p-4 transition-all duration-150",
        isActive
          ? "bg-slate-900 border-slate-700 hover:border-slate-600"
          : "bg-slate-900/40 border-slate-800/60 opacity-60",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={[
          "w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0",
          isActive ? "bg-slate-800" : "bg-slate-800/50",
        ].join(" ")}>
          {emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold leading-snug ${isActive ? "text-slate-100" : "text-slate-400 line-through"}`}>
              {task.title}
            </p>
            <TaskStatusBadge status={task.status} />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            {time && (
              <span className="flex items-center gap-1">
                <IconClock size={10} />
                {time}
              </span>
            )}
            {task.duration_minutes && (
              <span>{task.duration_minutes} min</span>
            )}
            {task.anchor_flag && (
              <span className="text-indigo-500 font-medium">anchor</span>
            )}
          </div>

          {task.why_now && isActive && (
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">{task.why_now}</p>
          )}

          {isActive && (
            <div className="flex items-center gap-2">
              <Button
                variant="success"
                size="xs"
                onClick={() => onComplete(task.id)}
                loading={loading}
              >
                <IconCheck size={10} />
                Done
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onSkip(task.id)}
              >
                <IconX size={10} />
                Skip
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onEvidence(task)}
              >
                <IconInfo size={10} />
                Evidence
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
